import { addNotification } from '../utils/notificationBus.js';
import { Op } from 'sequelize';

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * RESERVATION SERVICE - Production-Ready with Smart Capacity Management
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * FEATURES:
 * 1. SMART SLOT ASSIGNMENT (Capacity Management)
 *    - If a slot is busy, automatically finds a free "sibling" slot (same time/terrain)
 *    - Solves the "multiple users blocking each other" issue
 * 
 * 2. CONCURRENCY SAFETY
 *    - Uses FOR UPDATE locks to prevent race conditions
 * 
 * 3. OVERRIDE LOGIC
 *    - Allows paid (Credit) reservations to override pending (Sur place) ones
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 */

export default function ReservationService(models) {
  
  // ════════════════════════════════════════════════════════════════════════════
  // UTILITY: Audit log for credit transactions
  // ════════════════════════════════════════════════════════════════════════════
  const logCreditTransaction = async (userId, amount, type, t) => {
    try {
      await models.credit_transaction.create({
        id_utilisateur: userId,
        nombre: amount,
        type,
        date_creation: new Date(),
      }, t ? { transaction: t } : undefined);
    } catch (err) {
      console.warn('[RefundService] Failed to write credit_transaction:', err?.message);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // UTILITY: Idempotent refund with duplicate prevention
  // ════════════════════════════════════════════════════════════════════════════
  const refundUserIdempotent = async (userId, amount, reservationId, participantId, t) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      console.log(`[RefundService] Skip refund user ${userId} - invalid amount=${amount}`);
      return false;
    }

    const auditKey = `refund:R${reservationId}:U${userId}:P${participantId}`;

    // Check for duplicate refund
    const existing = await models.credit_transaction.findOne({
      where: { id_utilisateur: userId, type: auditKey },
      transaction: t,
      lock: t?.LOCK?.UPDATE,
    });
    
    if (existing) {
      console.log('[RefundService] Duplicate refund prevented for', auditKey);
      return false;
    }

    const user = await models.utilisateur.findByPk(userId, { 
      transaction: t, 
      lock: t?.LOCK?.UPDATE 
    });
    
    if (!user) {
      console.log(`[RefundService] User ${userId} not found`);
      return false;
    }
    
    const currentBalance = Number(user.credit_balance ?? 0);
    const newBalance = currentBalance + amount;
    await user.update({ credit_balance: newBalance }, { transaction: t });
    await logCreditTransaction(userId, amount, auditKey, t);
    
    console.log(`[RefundService] Refunded user ${userId} amount=${amount} (${currentBalance} -> ${newBalance})`);
    return true;
  };

  // ════════════════════════════════════════════════════════════════════════════
  // UTILITY: Handle pending match override (Clears ANY pending match for Credit takeover)
  // ════════════════════════════════════════════════════════════════════════════
  const handleOpenMatchOverride = async (plageHoraireId, date, t, models) => {
    console.log('[Override] Starting override process for all pending matches', { plageHoraireId, date });
    
    try {
      // Find all active reservations (Private OR Open) that are NOT confirmed (etat != 1)
      const openMatchReservations = await models.reservation.findAll({
        where: {
          id_plage_horaire: plageHoraireId,
          date: date,
          typer: { [Op.or]: [1, 2] }, // Target BOTH Private (1) and Open (2)
          isCancel: 0,
          etat: { [Op.ne]: 1 } // etat ≠ 1 (invalid/pending reservations)
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      console.log('[Override] Found pending reservations to cancel', {
        count: openMatchReservations.length
      });

      for (const reservation of openMatchReservations) {
        // 1. Cancel the reservation
        await reservation.update({ 
          isCancel: 1,
          etat: -1, // Mark as cancelled
          date_modif: new Date()
        }, { transaction: t });

        // 2. Find all participants for this reservation
        const participants = await models.participant.findAll({
          where: { id_reservation: reservation.id },
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        // 3. Refund all participants (including the creator)
        const usersToRefund = new Set();
        usersToRefund.add(reservation.id_utilisateur);
        participants.forEach(participant => usersToRefund.add(participant.id_utilisateur));

        // Refund each user
        for (const userId of usersToRefund) {
          await refundUserIdempotent(
            userId, 
            reservation.prix_total, 
            reservation.id, 
            userId === reservation.id_utilisateur ? null : userId,
            t
          );
        }

        // 4. Remove all participants
        if (participants.length > 0) {
          await models.participant.destroy({
            where: { id_reservation: reservation.id },
            transaction: t
          });
        }

        // 5. Add notification
        try {
          await addNotification(reservation.id_utilisateur, {
            type: 'reservation_cancelled',
            title: 'Réservation annulée',
            message: `Votre réservation du ${date} a été annulée car un autre joueur a confirmé le créneau avec un paiement immédiat (Crédits).`,
            data: { reservationId: reservation.id }
          });
        } catch (notificationError) {
          console.warn('[Override] Failed to add notification:', notificationError);
        }
      }
    } catch (error) {
      console.error('[Override] Error during override process:', error);
      throw error;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN: Create Reservation with Smart Capacity & Race Condition Protection
  // ════════════════════════════════════════════════════════════════════════════
  const create = async (data) => {
    const t = await models.sequelize.transaction({
      isolationLevel: models.Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
    });

    try {
      console.log('[ReservationService] Starting reservation creation', {
        userId: data.id_utilisateur,
        slotId: data.id_plage_horaire,
        date: data.date,
        typer: data.typer
      });

      // ══════════════════════════════════════════════════════════════════════
      // STEP 1: Validate terrain exists
      // ══════════════════════════════════════════════════════════════════════
      const terrain = await models.terrain.findByPk(data.id_terrain, { transaction: t });
      if (!terrain) {
        throw new Error("Terrain not found");
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 2: Lock user row for balance operations
      // ══════════════════════════════════════════════════════════════════════
      const utilisateur = await models.utilisateur.findByPk(data.id_utilisateur, { 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      if (!utilisateur) {
        throw new Error("Utilisateur not found");
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 3: CRITICAL - Lock the requested plage_horaire row
      // ══════════════════════════════════════════════════════════════════════
      // We use 'let' because we might swap it for a sibling if this one is full
      let plage = await models.plage_horaire.findByPk(data.id_plage_horaire, { 
        transaction: t, 
        lock: t.LOCK.UPDATE
      });
      
      if (!plage) {
        throw new Error("Plage horaire not found");
      }

      console.log('[ReservationService] Acquired lock on plage_horaire', {
        id: plage.id,
        disponible: plage.disponible
      });

      // ══════════════════════════════════════════════════════════════════════
      // STEP 4: SMART SLOT REASSIGNMENT (Capacity Handling)
      // ══════════════════════════════════════════════════════════════════════
      // Check for ANY active reservation on this SPECIFIC slot
      let existingReservations = await models.reservation.findAll({
        where: {
          id_plage_horaire: plage.id, // Use plage.id (current candidate)
          date: data.date,
          isCancel: 0
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      // If the specific slot is taken, look for FREE SIBLINGS (Capacity > 1)
      if (existingReservations.length > 0) {
        console.log(`[ReservationService] Slot ${plage.id} is busy. Searching for siblings...`);
        
        // Find other slots with same Time + Terrain
        const siblings = await models.plage_horaire.findAll({
          where: {
            terrain_id: plage.terrain_id,
            start_time: plage.start_time,
            end_time: plage.end_time,
            id: { [Op.ne]: plage.id } // Exclude current
          },
          transaction: t,
          lock: t.LOCK.UPDATE // Lock them too
        });

        let freeSiblingFound = false;

        for (const sibling of siblings) {
           // Check availability for this sibling
           const siblingReservation = await models.reservation.findOne({
              where: {
                id_plage_horaire: sibling.id,
                date: data.date,
                isCancel: 0
              },
              transaction: t
           });
           
           if (!siblingReservation) {
             // Found a free slot! Switch to it.
             console.log(`[ReservationService] ✅ Switching to free sibling slot: ${sibling.id}`);
             plage = sibling; // Update local reference
             data.id_plage_horaire = sibling.id; // Update payload ID
             existingReservations = []; // Clear conflict list
             freeSiblingFound = true;
             break; // Stop searching
           }
        }

        if (!freeSiblingFound) {
          console.log(`[ReservationService] ❌ All sibling slots are full.`);
          // If no siblings are free, we proceed with 'existingReservations' populated,
          // which will trigger the Conflict Resolution logic below (Step 5).
        }
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 5: Handle conflicts (if NO free slot was found)
      // ══════════════════════════════════════════════════════════════════════
      if (existingReservations.length > 0) {
        // 1. Check if ANY existing reservation is VALID (etat = 1)
        const validReservation = existingReservations.find(r => Number(r.etat) === 1);
        
        if (validReservation) {
           // If a valid reservation exists, NO ONE can override it.
           const error = new Error('Ce créneau est déjà réservé et confirmé par un autre joueur.');
           error.statusCode = 409;
           throw error;
        }

        // 2. All existing reservations are PENDING. Determine action based on Payment Type.
        const requestedPayType = Number(data?.typepaiementForCreator ?? data?.typepaiement ?? 1);
        const isSurPlace = requestedPayType === 2; // 2 = Sur place (Pending)

        if (isSurPlace) {
           // SCENARIO: Sur place (Pending) vs Pending
           // ACTION: Allow Co-existence. Do NOT cancel others.
           console.log('[ReservationService] "Sur place" request -> Allowing co-existence with other pending reservations.');
           // We simply proceed to creation. The DB will hold multiple "etat: 0" reservations.
        } else {
           // SCENARIO: Credit (Valid) vs Pending
           // ACTION: Cancel ALL existing pending reservations to free the slot.
           console.log('[ReservationService] "Credit" request -> Overriding all pending reservations.');
           
           // Call override function to clear the path
           await handleOpenMatchOverride(data.id_plage_horaire, data.date, t, models);
        }
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 6: Validate and normalize price
      // ══════════════════════════════════════════════════════════════════════
      const plagePrice = Number(plage?.price);
      const normalizedPrice = Number.isFinite(plagePrice) && plagePrice > 0 
        ? plagePrice 
        : 1;

      const typerVal = Number(data?.typer ?? 0);

      // ══════════════════════════════════════════════════════════════════════
      // STEP 7: Validate rating range for open matches
      // ══════════════════════════════════════════════════════════════════════
      if (typerVal === 2) {
        const minFloat = Number(data?.min);
        const maxFloat = Number(data?.max);

        if (!Number.isFinite(minFloat) || !Number.isFinite(maxFloat)) {
          throw new Error('Rating range (min/max) is required for Match Ouvert');
        }
        
        if (minFloat > maxFloat) {
          throw new Error('Invalid rating range: min must be <= max');
        }
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 8: Handle payment and balance deduction
      // ══════════════════════════════════════════════════════════════════════
      const creatorPayType = Number(data?.typepaiementForCreator ?? data?.typepaiement ?? 1);
      const etatVal = Number(data?.etat ?? -1);
      const isOnsitePayment = (creatorPayType === 2) || (etatVal === 0);
      const shouldSkipDeduction = (typerVal === 1) && isOnsitePayment;

      // Store the charge amount for later use
      let creatorCharge = 0;

      if (!shouldSkipDeduction) {
        // Creator always pays full price
        creatorCharge = normalizedPrice;

        const currentBalance = Number(utilisateur.credit_balance ?? 0);
        
        if (!Number.isFinite(currentBalance) || currentBalance < creatorCharge) {
          throw new Error('Insufficient balance');
        }
        
        await utilisateur.update(
          { credit_balance: currentBalance - creatorCharge }, 
          { transaction: t }
        );
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 9: Create the reservation
      // ══════════════════════════════════════════════════════════════════════
      const payload = { ...data, prix_total: normalizedPrice };

      let reservation;
      try {
        reservation = await models.reservation.create(payload, { transaction: t });
        console.log('[ReservationService] Created reservation', { id: reservation.id });
        
        // ════════════════════════════════════════════════════════════════════
        // CRITICAL: Record the credit_transaction AFTER reservation is created
        // ════════════════════════════════════════════════════════════════════
        if (!shouldSkipDeduction && creatorCharge > 0) {
          await models.credit_transaction.create({
            id_utilisateur: data.id_utilisateur,
            nombre: -creatorCharge,
            type: `debit:reservation:R${reservation.id}:U${data.id_utilisateur}:creator`,
            date_creation: new Date()
          }, { transaction: t });
          
          // ✅ NOTIFICATION: Credit Deduction
          await addNotification({
            recipient_id: data.id_utilisateur,
            reservation_id: reservation.id,
            type: 'credit_deduction',
            message: `Votre réservation a été confirmée. ${creatorCharge} crédits ont été débités de votre compte.`
          });
        }

        // ✅ NOTIFICATION: Reservation Confirmation
        await addNotification({
          recipient_id: data.id_utilisateur,
          reservation_id: reservation.id,
          type: 'reservation_confirmed',
          message: `Votre réservation pour le ${data.date} a été confirmée avec succès.`
        });
        
      } catch (insertError) {
        // Handle unique constraint violation
        if (insertError.name === 'SequelizeUniqueConstraintError' || 
            insertError.parent?.code === '23505') {
          console.log('[ReservationService] Unique constraint violation - slot taken by another user');
          const error = new Error('Ce créneau vient d\'être réservé par un autre joueur. Veuillez rafraîchir et choisir un autre créneau.');
          error.statusCode = 409;
          throw error;
        }
        throw insertError;
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 10: Mark slot as unavailable (only for private matches)
      // ══════════════════════════════════════════════════════════════════════
      // NOTE: With smart reassignment, this only marks the *specific* assigned ID.
      // Other siblings remain 'disponible: true' (if they were true).
      if (typerVal !== 2 && !isOnsitePayment) {
        await plage.update({ disponible: false }, { transaction: t });
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 11: Create participant record for creator
      // ══════════════════════════════════════════════════════════════════════
      await models.participant.create({
        id_reservation: reservation.id,
        id_utilisateur: data.id_utilisateur,
        est_createur: true,
        statepaiement: shouldSkipDeduction ? 0 : 1,
        typepaiement: shouldSkipDeduction ? 2 : 1,
        team: 0,
      }, { transaction: t });

      // ══════════════════════════════════════════════════════════════════════
      // STEP 12: COMMIT - Release all locks
      // ══════════════════════════════════════════════════════════════════════
      await t.commit();
      console.log('[ReservationService] Transaction committed successfully');

      // Return reservation with all includes
      const finalReservation = await models.reservation.findByPk(reservation.id, {
        include: [
          { model: models.terrain, as: 'terrain' },
          { model: models.utilisateur, as: 'utilisateur' },
          { model: models.plage_horaire, as: 'plage_horaire' },
          { model: models.participant, as: 'participants' },
        ]
      });

      return finalReservation;

    } catch (err) {
      await t.rollback();
      console.error('[ReservationService] Transaction rolled back:', err.message);

      if (err.name === 'SequelizeDatabaseError' || err.message?.includes('deadlock')) {
         const error = new Error('Ce créneau vient d\'être réservé par un autre joueur. Veuillez rafraîchir.');
         error.statusCode = 409;
         throw error;
      }

      if (err.statusCode) {
        throw err;
      }
      throw err;
    }
  };

  const findAll = async () => {
    return await models.reservation.findAll({
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plage_horaire' }
      ]
    });
  };

  const findById = async (id) => {
    return await models.reservation.findByPk(id, {
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plage_horaire' }
      ]
    });
  };

  const findByUserId = async (userId) => {
    try {
      const createdReservations = await models.reservation.findAll({
        where: { id_utilisateur: userId },
        include: [
          { model: models.terrain, as: 'terrain' },
          { model: models.utilisateur, as: 'utilisateur' },
          { model: models.plage_horaire, as: 'plage_horaire' },
          { model: models.participant, as: 'participants' }
        ],
        order: [['date_creation', 'DESC']]
      });

      const participantRecords = await models.participant.findAll({
        where: { id_utilisateur: userId },
        attributes: ['id_reservation']
      });

      const participantReservationIds = [...new Set(participantRecords.map(p => p.id_reservation))];
      const createdIds = new Set(createdReservations.map(r => r.id));
      const additionalIds = participantReservationIds.filter(id => !createdIds.has(id));

      let additionalReservations = [];
      if (additionalIds.length > 0) {
        additionalReservations = await models.reservation.findAll({
          where: { id: additionalIds },
          include: [
            { model: models.terrain, as: 'terrain' },
            { model: models.utilisateur, as: 'utilisateur' },
            { model: models.plage_horaire, as: 'plage_horaire' },
            { model: models.participant, as: 'participants' }
          ],
          order: [['date_creation', 'DESC']]
        });
      }

      const allReservations = [...createdReservations, ...additionalReservations];
      allReservations.sort((a, b) => new Date(b.date_creation || 0) - new Date(a.date_creation || 0));
      return allReservations;
    } catch (err) {
      console.error('[findByUserId] Error:', err?.message);
      throw err;
    }
  };

  const findOne = async (filter) => {
    return await models.reservation.findOne({
      where: filter,
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plage_horaire' }
      ]
    });
  };

  const findByDate = async (dateStr) => {
    return await models.reservation.findAll({
      where: { date: dateStr },
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plage_horaire' },
        { model: models.participant, as: 'participants' },
      ],
      order: [['date', 'ASC']]
    });
  };

  const findAvailableByDate = async (dateStr) => {
    const rows = await models.reservation.findAll({
      where: { date: dateStr },
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plage_horaire' },
        { model: models.participant, as: 'participants' },
      ],
      order: [['date', 'ASC']]
    });
    
    return rows.filter((r) => {
      const typerVal = Number.parseInt((r.typer ?? 0).toString());
      const count = Array.isArray(r.participants) ? r.participants.length : 0;
      const isCancelled = Number(r.isCancel ?? 0) === 1;
      return typerVal === 2 && !isCancelled && count < 4;
    });
  };

  // ════════════════════════════════════════════════════════════════════════════
  // UPDATE OPERATIONS
  // ════════════════════════════════════════════════════════════════════════════

  const update = async (id, data) => {
    const reservation = await models.reservation.findByPk(id);
    if (!reservation) throw new Error("Reservation not found");
    
    const isStatusUpdateToValid = data.etat === 'valid' && reservation.etat !== 'valid';
    const isOpenMatch = reservation.typer === 2; 
    
    if (isStatusUpdateToValid && isOpenMatch) {
      const plage = await models.plage_horaire.findByPk(reservation.id_plage_horaire);
      if (plage) {
        await plage.update({ disponible: false });
      }
    }
    
    await reservation.update(data);
    return await findById(id);
  };

  const remove = async (id) => {
    const reservation = await models.reservation.findByPk(id);
    if (!reservation) throw new Error("Reservation not found");
    return await reservation.destroy();
  };

  // ════════════════════════════════════════════════════════════════════════════
  // CANCEL OPERATION (with proper locking)
  // ════════════════════════════════════════════════════════════════════════════

  const cancel = async (id, cancellingUserId) => {
    const t = await models.sequelize.transaction();
    
    try {
      console.log(`💰 [CancelService] Starting cancellation for reservation ${id}`);
      
      const reservation = await models.reservation.findByPk(id, { 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (Number(reservation.isCancel ?? 0) === 1) {
        await t.commit();
        return reservation;
      }

      // 24-Hour Policy Check
      const now = new Date();
      const matchStartTime = reservation.date;
      if (matchStartTime && now < matchStartTime) {
        const hoursUntilMatch = Math.floor((matchStartTime - now) / (1000 * 60 * 60));
        if (hoursUntilMatch <= 24) {
          const error = new Error('Annulation non autorisée : moins de 24 heures avant le match.');
          error.statusCode = 409;
          throw error;
        }
      }

      const plage = reservation.id_plage_horaire
        ? await models.plage_horaire.findByPk(reservation.id_plage_horaire, { 
            transaction: t, 
            lock: t.LOCK.UPDATE 
          })
        : null;

      const participants = await models.participant.findAll({
        where: { id_reservation: id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const creatorParticipant = participants.find(p => Boolean(p.est_createur));
      const isCancellerCreator = !!creatorParticipant && 
        Number(creatorParticipant.id_utilisateur) === Number(cancellingUserId);

      const slotPrice = (() => {
        const p = Number(plage?.price ?? reservation.prix_total ?? 0);
        return Number.isFinite(p) && p > 0 ? p : 0;
      })();

      // Refund helper
      const refundUser = async (userId, amount) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const user = await models.utilisateur.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
        if (user) {
          await user.update({ credit_balance: (user.credit_balance ?? 0) + amount }, { transaction: t });
          await logCreditTransaction(userId, amount, `refund:cancel:R${id}`, t);
        }
      };

      if (isCancellerCreator) {
        // Creator cancels - Refund EVERYONE and FREE THE SLOT
        for (const p of participants) {
          if (Number(p.statepaiement) === 1) {
            await refundUser(p.id_utilisateur, slotPrice);
          }
        }

        await reservation.update({ isCancel: 1, etat: 3, date_modif: new Date() }, { transaction: t });
        
        // Notify others
        for (const p of participants) {
          if (Number(p.id_utilisateur) !== Number(cancellingUserId)) {
            await addNotification({
              recipient_id: p.id_utilisateur,
              reservation_id: reservation.id,
              type: 'reservation_cancelled',
              message: 'Le créateur du match a annulé la réservation.'
            });
          }
        }

        await models.participant.destroy({ where: { id_reservation: id }, transaction: t });

        // FREE UP THE SLOT
        // Since we are using smart reassignment, freeing this specific ID makes it available 
        // for the next "Smart Search" to find.
        if (plage) {
          await plage.update({ disponible: true }, { transaction: t });
        }

      } else {
        // Participant leaves - Refund ONLY them
        const cancellerParticipant = participants.find(p => Number(p.id_utilisateur) === Number(cancellingUserId));
        if (!cancellerParticipant) throw new Error('User is not a participant');

        if (Number(cancellerParticipant.statepaiement) === 1) {
          await refundUser(cancellingUserId, slotPrice);
        }

        await models.participant.destroy({ where: { id_reservation: id, id_utilisateur: cancellingUserId }, transaction: t });
        await reservation.update({ date_modif: new Date() }, { transaction: t });
        
        // Notify
        for (const p of participants) {
          if (Number(p.id_utilisateur) !== Number(cancellingUserId)) {
             addNotification({
              recipient_id: p.id_utilisateur,
              reservation_id: reservation.id,
              type: 'participant_cancelled',
              message: 'Un participant a quitté le match.'
            });
          }
        }
      }

      await t.commit();
      return await models.reservation.findByPk(id, { include: [{ model: models.terrain, as: 'terrain' }] });

    } catch (err) {
      await t.rollback();
      throw err;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // BATCH REFUND PROCESSOR
  // ════════════════════════════════════════════════════════════════════════════

  const processStatusRefunds = async () => {
    const t = await models.sequelize.transaction();
    
    try {
      const reservations = await models.reservation.findAll({
        where: { isCancel: 0 },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      for (const reservation of reservations) {
        try {
          const [plageHoraire, participants] = await Promise.all([
            models.plage_horaire.findByPk(reservation.id_plage_horaire, { transaction: t }),
            models.participant.findAll({ where: { id_reservation: reservation.id }, transaction: t })
          ]);
          reservation.dataValues.plage_horaire = plageHoraire;
          reservation.dataValues.participants = participants;
        } catch (e) {}
      }

      const bySlot = new Map();
      for (const r of reservations) {
        const slotId = Number(r.id_plage_horaire);
        if (!bySlot.has(slotId)) bySlot.set(slotId, []);
        bySlot.get(slotId).push(r);
      }

      const slotPriceOf = (r) => {
        const p = Number(r?.plage_horaire?.price ?? r?.prix_total ?? 0);
        return Number.isFinite(p) && p > 0 ? p : 0;
      };

      for (const r of reservations) {
        if (Number(r?.etat ?? -1) === 0 && r.participants?.length > 0) {
          const slotPrice = slotPriceOf(r);
          for (const p of r.participants) {
            if (Number(p.statepaiement) === 1) {
              await refundUserIdempotent(p.id_utilisateur, slotPrice, r.id, p.id, t);
            }
          }
          await models.participant.destroy({ where: { id_reservation: r.id }, transaction: t });
          await models.reservation_utilisateur.destroy({ where: { id_reservation: r.id }, transaction: t });
        }
      }

      await t.commit();
      return { processedSlots: bySlot.size };

    } catch (err) {
      await t.rollback();
      throw err;
    }
  };

  return {
    create,
    findAll,
    findById,
    update,
    findByUserId,
    findOne,
    remove,
    findByDate,
    findAvailableByDate,
    cancel,
    processStatusRefunds,
  };
}
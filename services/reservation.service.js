import { addNotification } from '../utils/notificationBus.js';
import { Op } from 'sequelize';

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * RESERVATION SERVICE - Production-Ready with Banking-Level Reliability
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * This service handles concurrent booking requests safely using:
 * 
 * 1. DATABASE-LEVEL UNIQUE CONSTRAINT
 *    - UNIQUE INDEX on (id_plage_horaire, date) WHERE isCancel = 0
 *    - Even if application code fails, DB prevents double-booking
 * 
 * 2. ROW-LEVEL LOCKING (SELECT ... FOR UPDATE)
 *    - Locks the plage_horaire row during booking
 *    - Second user WAITS until first transaction completes
 * 
 * 3. SERIALIZABLE ISOLATION (optional, for extra safety)
 *    - Detects read-write conflicts at commit time
 *    - Retries or fails gracefully
 * 
 * FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ User A clicks Reserve                                                       │
 * │    ↓                                                                        │
 * │ BEGIN TRANSACTION                                                           │
 * │    ↓                                                                        │
 * │ SELECT * FROM plage_horaire WHERE id=X FOR UPDATE  ← LOCKS THE ROW          │
 * │    ↓                                                                        │
 * │ Check disponible = true? ──NO──→ Return 409 Conflict                        │
 * │    ↓ YES                                                                    │
 * │ INSERT INTO reservation ← DB UNIQUE constraint is final guard               │
 * │    ↓                                                                        │
 * │ UPDATE plage_horaire SET disponible = false                                 │
 * │    ↓                                                                        │
 * │ COMMIT ← Row unlocked, User B can now proceed                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
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
  // UTILITY: Handle open match override when private reservation takes over
  // ════════════════════════════════════════════════════════════════════════════
  const handleOpenMatchOverride = async (plageHoraireId, date, t, models) => {
    console.log('[OpenMatchOverride] Starting override process', { plageHoraireId, date });
    
    try {
      // Find all active open match reservations for this slot and date
      const openMatchReservations = await models.reservation.findAll({
        where: {
          id_plage_horaire: plageHoraireId,
          date: date,
          typer: 2, // Open match
          isCancel: 0,
          etat: { [Op.ne]: 1 } // etat ≠ 1 (invalid reservations)
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      console.log('[OpenMatchOverride] Found open match reservations to cancel', {
        count: openMatchReservations.length
      });

      for (const reservation of openMatchReservations) {
        console.log('[OpenMatchOverride] Processing reservation', {
          reservationId: reservation.id,
          userId: reservation.id_utilisateur,
          prix_total: reservation.prix_total
        });

        // 1. Cancel the reservation
        await reservation.update({ 
          isCancel: 1,
          etat: -1, // Mark as cancelled
          date_modif: new Date()
        }, { transaction: t });

        console.log('[OpenMatchOverride] Cancelled reservation', { reservationId: reservation.id });

        // 2. Find all participants for this reservation
        const participants = await models.participant.findAll({
          where: { id_reservation: reservation.id },
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        console.log('[OpenMatchOverride] Found participants', {
          reservationId: reservation.id,
          participantCount: participants.length
        });

        // 3. Refund all participants (including the creator)
        const usersToRefund = new Set();
        
        // Add the reservation creator
        usersToRefund.add(reservation.id_utilisateur);
        
        // Add all participants
        participants.forEach(participant => {
          usersToRefund.add(participant.id_utilisateur);
        });

        console.log('[OpenMatchOverride] Users to refund', {
          userIds: Array.from(usersToRefund),
          refundAmount: reservation.prix_total
        });

        // Refund each user
        for (const userId of usersToRefund) {
          await refundUserIdempotent(
            userId, 
            reservation.prix_total, 
            reservation.id, 
            userId === reservation.id_utilisateur ? null : userId, // For creator, participantId is null
            t
          );
        }

        // 4. Remove all participants
        if (participants.length > 0) {
          await models.participant.destroy({
            where: { id_reservation: reservation.id },
            transaction: t
          });
          
          console.log('[OpenMatchOverride] Removed participants', {
            reservationId: reservation.id,
            removedCount: participants.length
          });
        }

        // 5. Add notification for cancelled reservation
        try {
          await addNotification(reservation.id_utilisateur, {
            type: 'reservation_cancelled',
            title: 'Réservation annulée',
            message: `Votre match ouvert du ${date} a été annulé car un joueur privé a réservé le créneau. Le montant de ${reservation.prix_total}€ a été remboursé.`,
            data: { reservationId: reservation.id }
          });
        } catch (notificationError) {
          console.warn('[OpenMatchOverride] Failed to add notification:', notificationError);
        }
      }

      console.log('[OpenMatchOverride] Override process completed successfully');
      
    } catch (error) {
      console.error('[OpenMatchOverride] Error during override process:', error);
      throw error;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN: Create Reservation with Race Condition Protection
  // ════════════════════════════════════════════════════════════════════════════
  /**
   * Creates a reservation with production-grade concurrency safety.
   * 
   * PROTECTION LAYERS:
   * 1. Row-level lock on plage_horaire (FOR UPDATE)
   * 2. Application-level check (disponible flag)
   * 3. Database-level UNIQUE constraint (final guard)
   * 
   * @param {Object} data - Reservation data
   * @returns {Object} Created reservation with includes
   * @throws {Error} With statusCode 409 if slot already booked
   */
  // ════════════════════════════════════════════════════════════════════════════
// MAIN: Create Reservation with Race Condition Protection
// ════════════════════════════════════════════════════════════════════════════
/**
 * Creates a reservation with production-grade concurrency safety.
 * 
 * PROTECTION LAYERS:
 * 1. Row-level lock on plage_horaire (FOR UPDATE)
 * 2. Application-level check (disponible flag)
 * 3. Database-level UNIQUE constraint (final guard)
 * 
 * @param {Object} data - Reservation data
 * @returns {Object} Created reservation with includes
 * @throws {Error} With statusCode 409 if slot already booked
 */
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
    // STEP 3: CRITICAL - Lock the plage_horaire row with FOR UPDATE
    // ══════════════════════════════════════════════════════════════════════
    const plage = await models.plage_horaire.findByPk(data.id_plage_horaire, { 
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
    // STEP 4: Check if slot is available based on disponible flag
    // ══════════════════════════════════════════════════════════════════════
    // Note: disponible=true doesn't always mean available, because open matches
    // keep it true. We need to check for existing reservations too (STEP 5)
    if (plage.disponible === false) {
      console.log('[ReservationService] Slot not available (disponible=false)');
      const error = new Error('Ce créneau horaire a déjà été réservé. Veuillez choisir un autre créneau.');
      error.statusCode = 409;
      throw error;
    }

    // ══════════════════════════════════════════════════════════════════════
    // STEP 5: Handle existing reservations with proper validation
    // ══════════════════════════════════════════════════════════════════════
    const existingReservation = await models.reservation.findOne({
      where: {
        id_plage_horaire: data.id_plage_horaire,
        date: data.date,
        isCancel: 0
      },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (existingReservation) {
      console.log('[ReservationService] Found existing active reservation', {
        existingId: existingReservation.id,
        existingTyper: existingReservation.typer,
        existingEtat: existingReservation.etat
      });

      const existingTyper = Number(existingReservation.typer ?? 0);
      const requestedTyper = Number(data?.typer ?? 0);
      const existingEtat = Number(existingReservation.etat ?? -1);

      // ═══════════════════════════════════════════════════════════════════
      // CASE 1: Private reservation exists - ALWAYS BLOCK
      // ═══════════════════════════════════════════════════════════════════
      if (existingTyper === 1) {
        const error = new Error('Ce créneau horaire a déjà été réservé. Veuillez choisir un autre créneau.');
        error.statusCode = 409;
        throw error;
      }

      // ═══════════════════════════════════════════════════════════════════
      // CASE 2: Open match exists & user wants private reservation
      // ═══════════════════════════════════════════════════════════════════
      if (existingTyper === 2 && requestedTyper === 1) {
        // Check if open match is VALID (etat = 1 means confirmed/full)
        if (existingEtat === 1) {
          // Valid/confirmed open match - cannot override
          const error = new Error('Ce créneau est occupé par un match ouvert confirmé.');
          error.statusCode = 409;
          throw error;
        }
        
        // Open match is INVALID (etat ≠ 1) - allow private override
        if (existingEtat !== 1) {
          console.log('[ReservationService] Open match is not confirmed (etat ≠ 1), allowing private override');
          
          // Cancel existing open match and refund participants
          await handleOpenMatchOverride(data.id_plage_horaire, data.date, t, models);
          
          console.log('[ReservationService] Proceeding with private reservation after override');
          // Continue to create private reservation
        }
      }

      // ═══════════════════════════════════════════════════════════════════
      // CASE 3: Open match exists & user wants another open match
      // ═══════════════════════════════════════════════════════════════════
      if (existingTyper === 2 && requestedTyper === 2) {
        // Check if existing open match is valid/confirmed
        if (existingEtat === 1) {
          // Valid open match exists - user should join it instead
          const error = new Error('Un match ouvert confirmé existe déjà sur ce créneau. Rejoignez-le depuis l\'onglet "Matches Ouverts".');
          error.statusCode = 409;
          throw error;
        }
        
        // Existing open match is invalid (etat ≠ 1) - allow new open match
        if (existingEtat !== 1) {
          console.log('[ReservationService] Existing open match is invalid (etat ≠ 1), allowing new open match');
          
          // Cancel the invalid open match
          await handleOpenMatchOverride(data.id_plage_horaire, data.date, t, models);
          
          console.log('[ReservationService] Proceeding with new open match after clearing invalid one');
          // Continue to create new open match
        }
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

    console.log('💰 [ReservationService] Pricing Debug:', {
      plagePrice: plagePrice,
      normalizedPrice: normalizedPrice,
      typerVal: typerVal,
      plageId: plage.id,
      plagePriceRaw: plage?.price,
      isPriceValid: Number.isFinite(plagePrice) && plagePrice > 0
    });

    // ══════════════════════════════════════════════════════════════════════
    // STEP 7: Validate rating range for open matches
    // ══════════════════════════════════════════════════════════════════════
    // STEP 7: Validate rating range for open matches
    // STEP 7: Validate rating range for open matches
    if (typerVal === 2) {
      const minFloat = Number(data?.min);
      const maxFloat = Number(data?.max);

      if (!Number.isFinite(minFloat) || !Number.isFinite(maxFloat)) {
        throw new Error('Rating range (min/max) is required for Match Ouvert');
      }
      
      if (minFloat > maxFloat) {
        throw new Error('Invalid rating range: min must be <= max');
      }

      const sliderMin = 1.0;
      const sliderMax = 7.0;

      if (minFloat < sliderMin) throw new Error('La borne minimale doit être ≥ 1.0');
      if (maxFloat > sliderMax) throw new Error('La borne maximale doit être ≤ 7.0');
      
      // Allow any range the user chooses - no restriction based on user rating
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
      
      console.log('💰 [ReservationService] Payment Calculation:', {
        shouldSkipDeduction: shouldSkipDeduction,
        creatorPayType: creatorPayType,
        etatVal: etatVal,
        isOnsitePayment: isOnsitePayment,
        typerVal: typerVal,
        normalizedPrice: normalizedPrice,
        creatorCharge: creatorCharge,
        currentBalance: currentBalance,
        hasSufficientBalance: Number.isFinite(currentBalance) && currentBalance >= creatorCharge
      });
      
      if (!Number.isFinite(currentBalance) || currentBalance < creatorCharge) {
        throw new Error('Insufficient balance');
      }
      
      await utilisateur.update(
        { credit_balance: currentBalance - creatorCharge }, 
        { transaction: t }
      );
      
      console.log('💰 [ReservationService] Balance Deducted Successfully:', {
        userId: utilisateur.id,
        amount: creatorCharge,
        oldBalance: currentBalance,
        newBalance: currentBalance - creatorCharge,
        deductionType: 'reservation_creation'
      });
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
      // This prevents double-charges in ParticipantController
      // ════════════════════════════════════════════════════════════════════
      if (!shouldSkipDeduction && creatorCharge > 0) {
        await models.credit_transaction.create({
          id_utilisateur: data.id_utilisateur,
          nombre: -creatorCharge,
          type: `debit:reservation:R${reservation.id}:U${data.id_utilisateur}:creator`,
          date_creation: new Date()
        }, { transaction: t });
        
        console.log('💰 [ReservationService] Created credit_transaction record:', {
          userId: data.id_utilisateur,
          amount: -creatorCharge,
          type: `debit:reservation:R${reservation.id}:U${data.id_utilisateur}:creator`,
          reason: 'This prevents ParticipantController from double-charging'
        });
      }
      
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
    // For open matches (typer == 2), keep slot available until confirmed (etat == 1)
    if (typerVal !== 2) {
      await plage.update({ disponible: false }, { transaction: t });
      console.log('[ReservationService] Marked slot as unavailable');
    } else {
      console.log('[ReservationService] Slot kept available for open match (typer == 2)');
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

    console.log('[ReservationService] Created participant for creator');

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

    console.log('💰 [ReservationService] Final Summary - Reservation created:', {
      reservationId: finalReservation.id,
      userId: data.id_utilisateur,
      slotId: data.id_plage_horaire,
      date: data.date,
      typer: data.typer,
      price: normalizedPrice,
      plagePrice: plagePrice,
      shouldSkipDeduction: shouldSkipDeduction,
      creatorPayType: creatorPayType,
      etatVal: etatVal,
      isOnsitePayment: isOnsitePayment
    });

    return finalReservation;

  } catch (err) {
    // ══════════════════════════════════════════════════════════════════════
    // ROLLBACK on any error
    // ══════════════════════════════════════════════════════════════════════
    await t.rollback();
    console.error('[ReservationService] Transaction rolled back:', err.message);

    // ══════════════════════════════════════════════════════════════════════
    // Handle serialization failures (if using SERIALIZABLE isolation)
    // ══════════════════════════════════════════════════════════════════════
    if (err.name === 'SequelizeDatabaseError') {
      const pgCode = err.parent?.code;
      
      // 40001 = serialization_failure
      // 40P01 = deadlock_detected
      if (pgCode === '40001' || pgCode === '40P01' || 
          err.message?.includes('could not serialize') ||
          err.message?.includes('deadlock')) {
        const error = new Error('Ce créneau vient d\'être réservé par un autre joueur. Veuillez rafraîchir et choisir un autre créneau.');
        error.statusCode = 409;
        throw error;
      }
      
      // 23505 = unique_violation
      if (pgCode === '23505') {
        const error = new Error('Ce créneau a déjà été réservé. Veuillez choisir un autre créneau.');
        error.statusCode = 409;
        throw error;
      }
    }

    // Re-throw with statusCode if already set
    if (err.statusCode) {
      throw err;
    }

    // Unknown error - wrap it
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
      // Get reservations where user is creator
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

      // Get reservations where user is participant
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
    
    // Check if this is a status update to 'valid' for an open match
    const isStatusUpdateToValid = data.etat === 'valid' && reservation.etat !== 'valid';
    const isOpenMatch = reservation.typer === 2; // typer 2 = open match
    
    if (isStatusUpdateToValid && isOpenMatch) {
      // For open matches, when status changes to valid, mark the slot as unavailable
      const plage = await models.plage_horaire.findByPk(reservation.id_plage_horaire);
      if (plage) {
        await plage.update({ disponible: false });
        console.log(`[ReservationService] Open match ${id} is now valid, marked slot ${reservation.id_plage_horaire} as unavailable`);
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

// ════════════════════════════════════════════════════════════════════════════
// CANCEL OPERATION (with proper locking) - CORRECTED VERSION
// ════════════════════════════════════════════════════════════════════════════

const cancel = async (id, cancellingUserId) => {
  const t = await models.sequelize.transaction();
  
  try {
    console.log(`💰 [CancelService] Starting cancellation for reservation ${id} by user ${cancellingUserId}`);
    
    // Lock reservation row FIRST before trying to access its properties
    const reservation = await models.reservation.findByPk(id, { 
      transaction: t, 
      lock: t.LOCK.UPDATE 
    });
    
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Already cancelled?
    if (Number(reservation.isCancel ?? 0) === 1) {
      console.log('[CancelService] Already cancelled');
      await t.commit();
      return reservation;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 24-HOUR CANCELLATION POLICY VALIDATION
    // ═══════════════════════════════════════════════════════════════════════
    const now = new Date();
    const matchStartTime = reservation.date;
    
    if (matchStartTime && now < matchStartTime) {
      const hoursUntilMatch = Math.floor((matchStartTime - now) / (1000 * 60 * 60));
      
      if (hoursUntilMatch <= 24) {
        console.log(`[CancelService] 24h policy violation: ${hoursUntilMatch}h until match`);
        const error = new Error('Annulation non autorisée : le match commence dans moins de 24 heures. La politique d\'annulation exige un préavis de 24 heures minimum.');
        error.statusCode = 409; // Conflict - indicates policy violation
        error.code = 'LATE_CANCELLATION';
        throw error;
      }
    }

    // Lock related rows
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

    // NOW we can log all details since everything is defined
    console.log(`💰 [CancelService] Reservation Details:`, {
      reservationId: id,
      creatorId: reservation.id_utilisateur,
      slotId: reservation.id_plage_horaire,
      slotPrice: slotPrice,
      date: reservation.date,
      typer: reservation.typer,
      etat: reservation.etat
    });

    // Debug logging for refund analysis
    console.log(`[CancelService] Refund Analysis:`, {
      slotPrice,
      participantsCount: participants.length,
      creatorParticipant: creatorParticipant ? {
        id: creatorParticipant.id,
        userId: creatorParticipant.id_utilisateur,
        statepaiement: creatorParticipant.statepaiement,
        est_createur: creatorParticipant.est_createur,
        typepaiement: creatorParticipant.typepaiement
      } : null,
      allParticipants: participants.map(p => ({
        id: p.id,
        userId: p.id_utilisateur,
        statepaiement: p.statepaiement,
        est_createur: p.est_createur,
        typepaiement: p.typepaiement
      })),
      isCancellerCreator,
      reservationPrice: reservation.prix_total,
      plagePrice: plage?.price,
      reservationId: id,
      cancellingUserId
    });

    // Refund helper
    const refundUser = async (userId, amount) => {
      console.log(`💰 [CancelService] Attempting refund for user ${userId}: amount=${amount}`);
      
      if (!Number.isFinite(amount) || amount <= 0) {
        console.log(`💰 [CancelService] Skipping refund - invalid amount: ${amount}`);
        return;
      }
      
      const user = await models.utilisateur.findByPk(userId, { 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (!user) {
        console.log(`💰 [CancelService] Skipping refund - user not found: ${userId}`);
        return;
      }
      
      const currentBalance = Number(user.credit_balance ?? 0);
      const newBalance = currentBalance + amount;
      await user.update({ credit_balance: newBalance }, { transaction: t });
      await logCreditTransaction(userId, amount, `refund:cancel:R${id}`, t);
      console.log(`💰 [CancelService] Refund Completed for user ${userId}:`, {
        amountRefunded: amount,
        oldBalance: currentBalance,
        newBalance: newBalance,
        refundType: 'cancellation_refund'
      });
    };

    if (isCancellerCreator) {
      console.log(`💰 [CancelService] Creator cancellation - processing refunds for ${participants.length} participants`);
      console.log(`💰 [CancelService] Refund Summary:`, {
        totalParticipants: participants.length,
        slotPrice: slotPrice,
        totalRefundAmount: slotPrice * participants.filter(p => Number(p.statepaiement) === 1).length,
        participantsToRefund: participants.filter(p => Number(p.statepaiement) === 1).length
      });
      // Creator cancels - refund all paid participants
      for (const p of participants) {
        console.log(`💰 [CancelService] Processing participant ${p.id_utilisateur}: statepaiement=${p.statepaiement}, slotPrice=${slotPrice}`);
        if (Number(p.statepaiement) === 1 && slotPrice > 0) {
          console.log(`💰 [CancelService] Refunding participant ${p.id_utilisateur}`);
          await refundUser(p.id_utilisateur, slotPrice);
        } else {
          console.log(`💰 [CancelService] Skipping refund for participant ${p.id_utilisateur} - statepaiement=${p.statepaiement}, slotPrice=${slotPrice}`);
        }
      }

      await reservation.update({ 
        isCancel: 1, 
        etat: 3, 
        date_modif: new Date() 
      }, { transaction: t });

      // Notify other participants
      for (const p of participants) {
        if (Number(p.id_utilisateur) !== Number(cancellingUserId)) {
          addNotification({
            recipient_id: p.id_utilisateur,
            reservation_id: reservation.id,
            submitter_id: cancellingUserId,
            type: 'reservation_cancelled',
            message: 'Le créateur a annulé le match.'
          });
        }
      }

      await models.participant.destroy({ 
        where: { id_reservation: id }, 
        transaction: t 
      });

      // Free up the slot
      if (plage) {
        await plage.update({ disponible: true }, { transaction: t });
      }

    } else {
      console.log(`💰 [CancelService] Non-creator cancellation - processing refund for canceller only`);
      // Non-creator cancels
      const cancellerParticipant = participants.find(
        p => Number(p.id_utilisateur) === Number(cancellingUserId)
      );
      
      if (!cancellerParticipant) {
        throw new Error('Cancelling user is not a participant');
      }
      
      console.log(`💰 [CancelService] Non-creator Refund Summary:`, {
        cancellerId: cancellingUserId,
        slotPrice: slotPrice,
        statepaiement: cancellerParticipant.statepaiement,
        willRefund: Number(cancellerParticipant.statepaiement) === 1 && slotPrice > 0
      });
      console.log(`💰 [CancelService] Processing canceller ${cancellingUserId}: statepaiement=${cancellerParticipant.statepaiement}, slotPrice=${slotPrice}`);
      if (Number(cancellerParticipant.statepaiement) === 1 && slotPrice > 0) {
        console.log(`💰 [CancelService] Refunding canceller ${cancellingUserId}`);
        await refundUser(cancellingUserId, slotPrice);
      } else {
        console.log(`💰 [CancelService] Skipping refund for canceller ${cancellingUserId} - statepaiement=${cancellerParticipant.statepaiement}, slotPrice=${slotPrice}`);
      }

      await models.participant.destroy({ 
        where: { id_reservation: id, id_utilisateur: cancellingUserId }, 
        transaction: t 
      });

      await reservation.update({ date_modif: new Date() }, { transaction: t });

      // Notify other participants
      for (const p of participants) {
        if (Number(p.id_utilisateur) !== Number(cancellingUserId)) {
          addNotification({
            recipient_id: p.id_utilisateur,
            reservation_id: reservation.id,
            submitter_id: cancellingUserId,
            type: 'participant_cancelled',
            message: 'Un participant a quitté le match.'
          });
        }
      }
    }

    await t.commit();
    console.log('[CancelService] Completed successfully');

    return await models.reservation.findByPk(id, {
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plage_horaire' },
        { model: models.participant, as: 'participants' },
      ]
    });

  } catch (err) {
    await t.rollback();
    console.error('[CancelService] Error:', {
      message: err.message,
      stack: err.stack,
      reservationId: id,
      cancellingUserId: cancellingUserId
    });
    throw err;
  }
};
  // ════════════════════════════════════════════════════════════════════════════
  // BATCH REFUND PROCESSOR
  // ════════════════════════════════════════════════════════════════════════════

  const processStatusRefunds = async () => {
    const t = await models.sequelize.transaction();
    
    try {
      // Fetch reservations first without locking the join
      const reservations = await models.reservation.findAll({
        where: { isCancel: 0 },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      console.log('[RefundService] Starting refund processor');
      console.log(`[RefundService] Found ${reservations.length} reservations to process`);

      // Then fetch related data separately to avoid FOR UPDATE on joins
      for (const reservation of reservations) {
        try {
          const [plageHoraire, participants] = await Promise.all([
            models.plage_horaire.findByPk(reservation.id_plage_horaire, {
              transaction: t,
              lock: t.LOCK.UPDATE,
            }),
            models.participant.findAll({
              where: { id_reservation: reservation.id },
              transaction: t,
              lock: t.LOCK.UPDATE,
            })
          ]);
          
          reservation.dataValues.plage_horaire = plageHoraire;
          reservation.dataValues.participants = participants;
        } catch (fetchError) {
          console.warn(`[RefundService] Failed to fetch related data for reservation ${reservation.id}:`, fetchError.message);
          reservation.dataValues.plage_horaire = null;
          reservation.dataValues.participants = [];
        }
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

      // Refund invalid reservations
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

      // Handle slot conflicts
      for (const [slotId, group] of bySlot.entries()) {
        let winner = group.find(r => {
          const etatVal = Number(r?.etat ?? -1);
          const isOpen = Number(r?.typer ?? 0) === 2;
          const count = r.participants?.length ?? 0;
          return etatVal === 1 || (isOpen && count === 4);
        });

        if (!winner) continue;

        for (const r of group) {
          if (r.id === winner.id) continue;
          
          const slotPrice = slotPriceOf(r);
          for (const p of r.participants || []) {
            if (Number(p.statepaiement) === 1) {
              await refundUserIdempotent(p.id_utilisateur, slotPrice, r.id, p.id, t);
            }
          }
          
          await models.reservation.update(
            { etat: 0, date_modif: new Date() }, 
            { where: { id: r.id }, transaction: t }
          );
          await models.participant.destroy({ where: { id_reservation: r.id }, transaction: t });
          await models.reservation_utilisateur.destroy({ where: { id_reservation: r.id }, transaction: t });
        }
      }

      await t.commit();
      console.log('[RefundService] Completed');
      return { processedSlots: bySlot.size };

    } catch (err) {
      await t.rollback();
      console.error('[RefundService] Error:', {
        message: err.message,
        stack: err.stack,
        processedReservations: reservations?.length || 0
      });
      throw err;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // EXPORT
  // ════════════════════════════════════════════════════════════════════════════

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
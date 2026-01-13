import { addNotification } from '../utils/notificationBus.js';
import { Op } from 'sequelize';

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * RESERVATION SERVICE - FIXED: Proper Multi-Capacity Slot Management
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * CRITICAL FIX:
 * - Now properly checks CAPACITY vs RESERVATION COUNT
 * - A slot is only "full" when: active_reservations >= capacity
 * - Supports multiple concurrent users booking the same time slot
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
  // UTILITY: Cancel ONLY other VALID matches when a new valid match is created
  // PENDING matches are NOT cancelled - they compete for remaining slots
  // ════════════════════════════════════════════════════════════════════════════
  const handleValidMatchCreated = async (plageHoraireId, date, newValidReservationId, creatorUserId, t, models) => {
    console.log('[ValidMatch] Valid match created -> Cancelling other VALID reservations ONLY', { 
      plageHoraireId, 
      date,
      newValidReservationId,
      creatorUserId 
    });
    
    try {
      // Get the new reservation to determine its type
      const newReservation = await models.reservation.findByPk(newValidReservationId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!newReservation) {
        console.log('[ValidMatch] New reservation not found');
        return;
      }

      const newReservationType = Number(newReservation.typer);

      // 🔥 CRITICAL FIX: Get the plage_horaire to find ALL sibling slots
      const plage = await models.plage_horaire.findByPk(plageHoraireId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!plage) {
        console.log('[ValidMatch] Plage horaire not found');
        return;
      }

      // Get time for comparison
      const getTimeString = (timeVal) => {
        if (!timeVal) return null;
        if (typeof timeVal === 'string') return timeVal;
        const d = new Date(timeVal);
        return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
      };

      const startTimeStr = getTimeString(plage.start_time);
      const endTimeStr = getTimeString(plage.end_time);

      // Find ALL sibling slots (same terrain, same time)
      const allSiblingSlots = await models.sequelize.query(`
        SELECT id FROM plage_horaire
        WHERE terrain_id = :terrainId
          AND CAST(start_time AS TIME) = CAST(:startTime AS TIME)
          AND CAST(end_time AS TIME) = CAST(:endTime AS TIME)
      `, {
        replacements: {
          terrainId: plage.terrain_id,
          startTime: startTimeStr,
          endTime: endTimeStr
        },
        transaction: t,
        type: models.sequelize.QueryTypes.SELECT
      });

      const siblingSlotIds = allSiblingSlots.map(s => s.id);
      console.log(`[ValidMatch] Found ${siblingSlotIds.length} sibling slot IDs: [${siblingSlotIds.join(', ')}]`);

      // 🔥 NEW LOGIC: Only cancel other VALID (etat=1) reservations
      // PENDING (etat=0) reservations stay active and compete for remaining slots
      let whereClause = {
        id_plage_horaire: { [Op.in]: siblingSlotIds },
        date: date,
        isCancel: 0,
        etat: 1, // ← CRITICAL: Only cancel VALID matches!
        id: { [Op.ne]: newValidReservationId }
      };

      if (newReservationType === 1) {
        // PRIVATE match → Cancel ALL valid types
        console.log('[ValidMatch] PRIVATE match created → Cancelling other VALID reservation types');
      } else if (newReservationType === 2) {
        // OPEN match → Cancel only other VALID OPEN matches
        console.log('[ValidMatch] OPEN match became valid → Cancelling other VALID OPEN matches');
        whereClause.typer = 2;
      }

      // Find VALID reservations to cancel (NOT pending ones!)
      const reservationsToCancel = await models.reservation.findAll({
        where: whereClause,
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      console.log(`[ValidMatch] Found ${reservationsToCancel.length} VALID reservation(s) to cancel (pending matches remain active)`);

      for (const reservation of reservationsToCancel) {
        console.log(`[ValidMatch] Cancelling VALID reservation ${reservation.id} (typer=${reservation.typer}, etat=${reservation.etat}, slot=${reservation.id_plage_horaire})`);

        // 1. Cancel the reservation
        await reservation.update({ 
          isCancel: 1,
          etat: -1,
          date_modif: new Date()
        }, { transaction: t });

        // 2. Find all participants
        const participants = await models.participant.findAll({
          where: { id_reservation: reservation.id },
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        // 3. Build list of users to refund
        const usersToRefund = new Set();
        usersToRefund.add(reservation.id_utilisateur);
        participants.forEach(p => usersToRefund.add(p.id_utilisateur));

        // 4. Refund each user who paid
        for (const userId of usersToRefund) {
          // Check if user paid
          const userDebit = await models.credit_transaction.findOne({
            where: {
              id_utilisateur: userId,
              [Op.or]: [
                { type: `debit:reservation:R${reservation.id}:U${userId}:creator` },
                { type: { [Op.like]: `debit:join:R${reservation.id}:U${userId}%` } }
              ],
              nombre: { [Op.lt]: 0 }
            },
            transaction: t
          });

          if (userDebit) {
            await refundUserIdempotent(
              userId, 
              reservation.prix_total, 
              reservation.id, 
              userId === reservation.id_utilisateur ? null : userId,
              t
            );
            console.log(`[ValidMatch] ✅ Refunded ${reservation.prix_total} to user ${userId}`);
          } else {
            console.log(`[ValidMatch] ℹ️  User ${userId} didn't pay - no refund needed`);
          }
        }

        // 5. Remove all participants
        if (participants.length > 0) {
          await models.participant.destroy({
            where: { id_reservation: reservation.id },
            transaction: t
          });
        }

        // 6. Send notifications to all affected users
        for (const userId of usersToRefund) {
          try {
            await addNotification(userId, {
              type: 'reservation_cancelled',
              title: 'Réservation annulée',
              message: `Votre réservation du ${date} a été annulée car un autre match a été confirmé.`,
              data: { 
                cancelledReservationId: reservation.id,
                newReservationId: newValidReservationId
              }
            });
          } catch (err) {
            console.warn('[ValidMatch] Failed to send notification:', err);
          }
        }
      }

      console.log(`[ValidMatch] ✅ Successfully cancelled ${reservationsToCancel.length} VALID reservation(s). Pending reservations remain active.`);
    } catch (error) {
      console.error('[ValidMatch] Error during cancellation:', error);
      throw error;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // UTILITY: Cancel excess PENDING reservations when all slots are VALID
  // ════════════════════════════════════════════════════════════════════════════
  const cancelExcessPendingReservations = async (plageHoraireId, date, t, models) => {
    console.log('[ExcessCancel] Checking for excess pending reservations', {
      plageHoraireId,
      date
    });

    try {
      // Get the plage to find sibling slots
      const plage = await models.plage_horaire.findByPk(plageHoraireId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!plage) {
        console.log('[ExcessCancel] Plage horaire not found');
        return;
      }

      // Get time for comparison
      const getTimeString = (timeVal) => {
        if (!timeVal) return null;
        if (typeof timeVal === 'string') return timeVal;
        const d = new Date(timeVal);
        return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
      };

      const startTimeStr = getTimeString(plage.start_time);
      const endTimeStr = getTimeString(plage.end_time);

      // Find ALL sibling slots
      const allSiblingSlots = await models.sequelize.query(`
        SELECT id FROM plage_horaire
        WHERE terrain_id = :terrainId
          AND CAST(start_time AS TIME) = CAST(:startTime AS TIME)
          AND CAST(end_time AS TIME) = CAST(:endTime AS TIME)
      `, {
        replacements: {
          terrainId: plage.terrain_id,
          startTime: startTimeStr,
          endTime: endTimeStr
        },
        transaction: t,
        type: models.sequelize.QueryTypes.SELECT
      });

      const siblingSlotIds = allSiblingSlots.map(s => s.id);
      const totalCapacity = siblingSlotIds.length;

      console.log(`[ExcessCancel] Total capacity: ${totalCapacity} slots`);

      // Count VALID reservations
      const validReservations = await models.reservation.count({
        where: {
          id_plage_horaire: { [Op.in]: siblingSlotIds },
          date: date,
          isCancel: 0,
          etat: 1 // Valid matches
        },
        transaction: t
      });

      console.log(`[ExcessCancel] Valid reservations: ${validReservations}/${totalCapacity}`);

      // If all slots are full with valid matches, cancel ALL pending ones
      if (validReservations >= totalCapacity) {
        console.log('[ExcessCancel] All slots are full → Cancelling ALL pending reservations');

        // Find ALL pending reservations for this time
        const pendingReservations = await models.reservation.findAll({
          where: {
            id_plage_horaire: { [Op.in]: siblingSlotIds },
            date: date,
            isCancel: 0,
            etat: 0 // Pending only
          },
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        console.log(`[ExcessCancel] Found ${pendingReservations.length} pending reservation(s) to cancel`);

        for (const reservation of pendingReservations) {
          console.log(`[ExcessCancel] Cancelling pending reservation ${reservation.id}`);

          // 1. Cancel the reservation
          await reservation.update({
            isCancel: 1,
            etat: -1,
            date_modif: new Date()
          }, { transaction: t });

          // 2. Find all participants
          const participants = await models.participant.findAll({
            where: { id_reservation: reservation.id },
            transaction: t,
            lock: t.LOCK.UPDATE
          });

          // 3. Build list of users to refund
          const usersToRefund = new Set();
          usersToRefund.add(reservation.id_utilisateur);
          participants.forEach(p => usersToRefund.add(p.id_utilisateur));

          // 4. Refund each user who paid
          for (const userId of usersToRefund) {
            const userDebit = await models.credit_transaction.findOne({
              where: {
                id_utilisateur: userId,
                [Op.or]: [
                  { type: `debit:reservation:R${reservation.id}:U${userId}:creator` },
                  { type: { [Op.like]: `debit:join:R${reservation.id}:U${userId}%` } }
                ],
                nombre: { [Op.lt]: 0 }
              },
              transaction: t
            });

            if (userDebit) {
              await refundUserIdempotent(
                userId,
                reservation.prix_total,
                reservation.id,
                userId === reservation.id_utilisateur ? null : userId,
                t
              );
              console.log(`[ExcessCancel] ✅ Refunded ${reservation.prix_total} to user ${userId}`);
            }
          }

          // 5. Remove all participants
          if (participants.length > 0) {
            await models.participant.destroy({
              where: { id_reservation: reservation.id },
              transaction: t
            });
          }

          // 6. Send notifications
          for (const userId of usersToRefund) {
            try {
              await addNotification(userId, {
                type: 'reservation_cancelled',
                title: 'Réservation annulée',
                message: `Votre réservation du ${date} a été annulée car tous les créneaux sont maintenant complets.`,
                data: {
                  cancelledReservationId: reservation.id,
                  reason: 'all_slots_full'
                }
              });
            } catch (err) {
              console.warn('[ExcessCancel] Failed to send notification:', err);
            }
          }
        }

        console.log(`[ExcessCancel] ✅ Successfully cancelled ${pendingReservations.length} pending reservation(s)`);
      } else {
        console.log(`[ExcessCancel] Slots not full yet (${validReservations}/${totalCapacity}) - pending reservations remain active`);
      }
    } catch (error) {
      console.error('[ExcessCancel] Error during excess cancellation:', error);
      throw error;
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 🔥 FIXED: Check if a slot has available capacity with PROPER LOCKING
  // ════════════════════════════════════════════════════════════════════════════
  const hasAvailableCapacity = async (plageHoraireId, date, t) => {
    // Get the plage_horaire to check its capacity
    const plage = await models.plage_horaire.findByPk(plageHoraireId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!plage) {
      return false;
    }

    // Get capacity (default to 1 if not set)
    const capacity = Number(plage.capacity ?? 1);

    // 🔥 CRITICAL FIX: Lock ONLY VALID reservations for this slot+date
    // PENDING reservations (etat=0) don't count towards capacity!
    const existingReservations = await models.reservation.findAll({
      where: {
        id_plage_horaire: plageHoraireId,
        date: date,
        isCancel: 0,
        etat: 1  // ← CRITICAL: Only count VALID reservations!
      },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    const activeReservations = existingReservations.length;
    const available = activeReservations < capacity;
    
    console.log(`[Capacity Check] Slot ${plageHoraireId} on ${date}: ${activeReservations}/${capacity} valid reservations - Available: ${available}`);
    
    return available;
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
      let plage = await models.plage_horaire.findByPk(data.id_plage_horaire, { 
        transaction: t, 
        lock: t.LOCK.UPDATE
      });
      
      if (!plage) {
        throw new Error("Plage horaire not found");
      }

      console.log('[ReservationService] Acquired lock on plage_horaire', {
        id: plage.id,
        disponible: plage.disponible,
        capacity: plage.capacity ?? 1
      });

      // ══════════════════════════════════════════════════════════════════════
      // STEP 4: 🔥 FIXED - SMART SLOT REASSIGNMENT (Proper Capacity Handling)
      // ══════════════════════════════════════════════════════════════════════
      
      // Check if the requested slot has available capacity
      const hasCapacity = await hasAvailableCapacity(plage.id, data.date, t);

      if (!hasCapacity) {
        console.log(`[ReservationService] ⚠️ Slot ${plage.id} is at capacity. Searching for siblings...`);
        
        // Extract time parts for comparison (handle both TIME and TIMESTAMP formats)
        const getTimeString = (timeVal) => {
          if (!timeVal) return null;
          if (typeof timeVal === 'string') return timeVal;
          // If it's a Date object, extract HH:MM:SS
          const d = new Date(timeVal);
          return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
        };
        
        const startTimeStr = getTimeString(plage.start_time);
        const endTimeStr = getTimeString(plage.end_time);
        
        console.log(`[ReservationService] 🔍 Looking for: terrain_id=${plage.terrain_id}, start_time=${startTimeStr}, end_time=${endTimeStr}`);
        
        // 🔥 FIX: Use raw SQL for reliable time matching
        const siblings = await models.sequelize.query(`
          SELECT * FROM plage_horaire
          WHERE terrain_id = :terrainId
            AND id != :currentId
            AND CAST(start_time AS TIME) = CAST(:startTime AS TIME)
            AND CAST(end_time AS TIME) = CAST(:endTime AS TIME)
          FOR UPDATE
        `, {
          replacements: {
            terrainId: plage.terrain_id,
            currentId: plage.id,
            startTime: startTimeStr,
            endTime: endTimeStr
          },
          transaction: t,
          type: models.sequelize.QueryTypes.SELECT
        });

        console.log(`[ReservationService] 🔍 Found ${siblings.length} sibling slot(s): [${siblings.map(s => s.id).join(', ')}]`);

        let freeSiblingFound = false;

        // Check each sibling for available capacity
        for (const sibling of siblings) {
          const siblingHasCapacity = await hasAvailableCapacity(sibling.id, data.date, t);
          
          console.log(`[ReservationService] 🔍 Checking sibling ${sibling.id}: hasCapacity=${siblingHasCapacity}`);
          
          if (siblingHasCapacity) {
            // Found a slot with available capacity! Switch to it.
            console.log(`[ReservationService] ✅ Switching to sibling slot with capacity: ${sibling.id}`);
            
            // Re-fetch as model instance with lock
            plage = await models.plage_horaire.findByPk(sibling.id, {
              transaction: t,
              lock: t.LOCK.UPDATE
            });
            
            data.id_plage_horaire = sibling.id; // Update payload ID
            freeSiblingFound = true;
            break; // Stop searching
          }
        }

        if (!freeSiblingFound) {
          console.log(`[ReservationService] ❌ All ${siblings.length + 1} slot(s) for this time are at full capacity.`);
          const error = new Error('Tous les créneaux pour cette heure sont complets. Veuillez choisir une autre heure.');
          error.statusCode = 409;
          throw error;
        }
      } else {
        console.log(`[ReservationService] ✅ Slot ${plage.id} has available capacity.`);
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 5: Validate no valid reservations exist
      // (Cancellation happens AFTER creation in STEP 10)
      // ══════════════════════════════════════════════════════════════════════
      
      const existingReservations = await models.reservation.findAll({
        where: {
          id_plage_horaire: plage.id,
          date: data.date,
          isCancel: 0,
          etat: 1 // Only check for VALID reservations
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (existingReservations.length > 0) {
        // Slot already has a valid reservation
        const error = new Error('Ce créneau est complet avec une réservation confirmée.');
        error.statusCode = 409;
        throw error;
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
      
      // 🔥 FIX: More robust payment type detection
      const creatorPayType = (() => {
        if (data.typepaiementForCreator !== undefined && data.typepaiementForCreator !== null) {
          return Number(data.typepaiementForCreator);
        }
        if (data.typepaiement !== undefined && data.typepaiement !== null) {
          return Number(data.typepaiement);
        }
        return 1; // Default to credit
      })();
      
      const etatVal = Number(data?.etat ?? -1);
      const isOnsitePayment = (creatorPayType === 2) || (etatVal === 0);
      const shouldSkipDeduction = (typerVal === 1) && isOnsitePayment;
      
      console.log(`[ReservationService] 💳 Payment detection:`, {
        typepaiementForCreator: data.typepaiementForCreator,
        typepaiement: data.typepaiement,
        etat: data.etat,
        resolved_creatorPayType: creatorPayType,
        resolved_isOnsitePayment: isOnsitePayment
      });

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
      // STEP 9: FINAL VALIDATION - Prevent double-booking same slot
      // ══════════════════════════════════════════════════════════════════════
      
      // 🔥 CRITICAL: Re-check capacity one more time RIGHT before creating
      // This prevents race condition where another user books between STEP 4 and now
      const finalCapacityCheck = await hasAvailableCapacity(plage.id, data.date, t);
      
      if (!finalCapacityCheck) {
        console.log(`[ReservationService] ⚠️ RACE CONDITION: Slot ${plage.id} was just filled by another user`);
        const error = new Error('Ce créneau vient d\'être réservé par un autre joueur. Veuillez rafraîchir.');
        error.statusCode = 409;
        throw error;
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 10: Create the reservation
      // ══════════════════════════════════════════════════════════════════════
      const payload = { ...data, prix_total: normalizedPrice };

      let reservation;
      try {
        reservation = await models.reservation.create(payload, { transaction: t });
        console.log('[ReservationService] ✅ Created reservation', { id: reservation.id, slotId: plage.id });
        
        // Record the credit_transaction AFTER reservation is created
        if (!shouldSkipDeduction && creatorCharge > 0) {
          await models.credit_transaction.create({
            id_utilisateur: data.id_utilisateur,
            nombre: -creatorCharge,
            type: `debit:reservation:R${reservation.id}:U${data.id_utilisateur}:creator`,
            date_creation: new Date()
          }, { transaction: t });
          
          // Notification: Credit Deduction
          await addNotification({
            recipient_id: data.id_utilisateur,
            reservation_id: reservation.id,
            type: 'credit_deduction',
            message: `Votre réservation a été confirmée. ${creatorCharge} crédits ont été débités de votre compte.`
          });
        }

        // Notification: Reservation Confirmation
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
      // STEP 11: Check if all slots are full and cancel excess pending
      // ══════════════════════════════════════════════════════════════════════

      // Check if we created a VALID match (private with credit)
      const isPrivateWithCredit = (typerVal === 1) && (creatorPayType === 1);

      if (isPrivateWithCredit) {
        // Private match is valid immediately (etat=1)
        // Each valid match takes ONE slot only
        // NO need to cancel other valid matches - they can coexist!
        
        console.log('[ReservationService] Created VALID private match → Checking if all slots full');

        // Only check if all slots are now full
        // If yes, cancel remaining PENDING reservations
        await cancelExcessPendingReservations(
          data.id_plage_horaire,
          data.date,
          t,
          models
        );
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 12: Update slot availability
      // ══════════════════════════════════════════════════════════════════════
      
      // 🔍 DIAGNOSTIC LOGGING
      console.log(`[ReservationService] 🔍 Availability check:`, {
        typerVal,
        creatorPayType,
        etatVal,
        isOnsitePayment,
        shouldMarkUnavailable: typerVal === 1 && !isOnsitePayment
      });
      
      // For PRIVATE matches with CREDIT payment: Mark slot as unavailable immediately
      if (typerVal === 1 && !isOnsitePayment) {
        // Private match + Credit payment → Slot is now taken
        await plage.update({ disponible: false }, { transaction: t });
        console.log(`[ReservationService] 🔒 Slot ${plage.id} marked as unavailable (private + credit)`);
      } else if (typerVal !== 2 && !isOnsitePayment) {
        // For other cases: Check if this slot is now at full capacity
        const nowAtCapacity = !(await hasAvailableCapacity(plage.id, data.date, t));
        
        if (nowAtCapacity) {
          await plage.update({ disponible: false }, { transaction: t });
          console.log(`[ReservationService] 🔒 Slot ${plage.id} marked as unavailable (at capacity)`);
        }
      } else {
        console.log(`[ReservationService] ℹ️ Slot ${plage.id} kept available (typer=${typerVal}, onsite=${isOnsitePayment})`);
      }

      // ══════════════════════════════════════════════════════════════════════
      // STEP 13: Create participant record for creator
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
      // STEP 14: COMMIT - Release all locks
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

        // 🔥 FIXED: Re-enable slot if it now has capacity
        if (plage) {
          const stillHasCapacity = await hasAvailableCapacity(plage.id, reservation.date, t);
          if (stillHasCapacity) {
            await plage.update({ disponible: true }, { transaction: t });
            console.log(`[CancelService] ✅ Slot ${plage.id} re-enabled (has capacity after cancellation)`);
          }
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
    cancelExcessPendingReservations,  // ← Export for use in participant.controller
  };
}
import { addNotification } from '../utils/notificationBus.js';

export default function ReservationService(models) {
  // Utility: create an audit log entry for credit changes (refunds)
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

  // Utility: idempotent refund to a user with audit entry and duplicate-prevention
  const refundUserIdempotent = async (userId, amount, reservationId, participantId, t) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      console.log(`[RefundService] Skip refund user ${userId} - invalid amount=${amount}`);
      return false;
    }

    const auditKey = `refund:R${reservationId}:U${userId}:P${participantId}`;

    // Basic duplicate prevention: check if this auditKey already exists in credit_transaction.type
    const existing = await models.credit_transaction.findOne({
      where: {
        id_utilisateur: userId,
        type: auditKey,
      },
      transaction: t,
      lock: t?.LOCK?.UPDATE,
    });
    if (existing) {
      console.log('[RefundService] Duplicate refund prevented for', auditKey);
      return false;
    }

    const user = await models.utilisateur.findByPk(userId, { transaction: t, lock: t?.LOCK?.UPDATE });
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

  const create = async (data) => {
    // Run reservation creation and balance deduction atomically
    const t = await models.sequelize.transaction();
    try {
      const terrain = await models.terrain.findByPk(data.id_terrain, { transaction: t });
      if (!terrain) throw new Error("Terrain not found");

      const utilisateur = await models.utilisateur.findByPk(data.id_utilisateur, { transaction: t, lock: t.LOCK.UPDATE });
      if (!utilisateur) throw new Error("Utilisateur not found");

      const plage = await models.plage_horaire.findByPk(data.id_plage_horaire, { transaction: t, lock: t.LOCK.UPDATE });
      if (!plage) throw new Error("Plage horaire not found");

      // Normalize prix_total from selected plage_horaire price
      const plagePrice = Number(plage?.price);
      const normalizedPrice = Number.isFinite(plagePrice) && plagePrice > 0
        ? plagePrice
        : 1;

      // Reservation type (1: private, 2: open)
      const typerVal = Number(data?.typer ?? 0);

      // Validate rating range for open matches (typer == 2)
      if (typerVal === 2) {
        const minInt = Number(data?.min);
        const maxInt = Number(data?.max);
        const userNote = Number(utilisateur?.note ?? 0);

        if (!Number.isFinite(minInt) || !Number.isFinite(maxInt)) {
          throw new Error('Rating range (min/max) is required for Match Ouvert');
        }
        const minFloat = minInt / 10;
        const maxFloat = maxInt / 10;
        if (minFloat > maxFloat) {
          throw new Error('Invalid rating range: min must be <= max');
        }
        // New asymmetric rule:
        // - min (left thumb) can go down to global slider min (>= 1.0), but cannot exceed (userNote + 0.1)
        // - max (right thumb) cannot go below userNote and can go up to global slider max (<= 7.0)
        const sliderMin = 1.0;
        const sliderMax = 7.0;
        const startMax = userNote + 0.1;
        const endMin = userNote;

        if (minFloat < sliderMin) {
          throw new Error('La borne minimale doit être ≥ 1.0');
        }
        if (maxFloat > sliderMax) {
          throw new Error('La borne maximale doit être ≤ 7.0');
        }
        if (minFloat > startMax) {
          throw new Error("La borne minimale ne peut pas dépasser votre note + 0.1");
        }
        if (maxFloat < endMin) {
          throw new Error("La borne maximale ne peut pas être inférieure à votre note");
        }
      }

      // Determine payment mode for creator
      const creatorPayType = Number(data?.typepaiementForCreator ?? data?.typepaiement ?? 1); // 1: crédit, 2: sur place
      const etatVal = Number(data?.etat ?? -1);
      const isOnsitePayment = (creatorPayType === 2) || (etatVal === 0);
      const shouldSkipDeduction = (typerVal === 1) && isOnsitePayment;

      if (!shouldSkipDeduction) {
        // For open match (typer==2), the creator pays only their seat (1/4 of total)
        const creatorCharge = (typerVal === 2) ? (normalizedPrice / 4) : normalizedPrice;
        // Ensure user has sufficient credit_balance
        const currentBalance = Number(utilisateur.credit_balance ?? 0);
        if (!Number.isFinite(currentBalance) || currentBalance < creatorCharge) {
          throw new Error('Insufficient balance');
        }
        // Deduct from credit_balance
        await utilisateur.update({ credit_balance: currentBalance - creatorCharge }, { transaction: t });
      }

      // Create reservation with normalized prix_total
      const payload = { ...data, prix_total: normalizedPrice };
      const reservation = await models.reservation.create(payload, { transaction: t });

      // Mark plage as unavailable
      await plage.update({ disponible: false }, { transaction: t });

      // Auto-register creator as a participant of this reservation
      await models.participant.create({
        id_reservation: reservation.id,
        id_utilisateur: data.id_utilisateur,
        est_createur: true,
        statepaiement: shouldSkipDeduction ? 0 : 1,
        typepaiement: shouldSkipDeduction ? 2 : 1,
        // Default team position for creator in open match panels
        team: 0,
      }, { transaction: t });

      await t.commit();

      // Return reservation with details including participants
      return await models.reservation.findByPk(reservation.id, {
        include: [
          { model: models.terrain, as: 'terrain' },
          { model: models.utilisateur, as: 'utilisateur' },
          { model: models.plage_horaire, as: 'plage_horaire' },
          { model: models.participant, as: 'participants' },
        ]
      });
    } catch (err) {
      await t.rollback();
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
    // Return reservations where the user is either the creator (id_utilisateur)
    // OR is present in participants for that reservation
    try {
      // First, get all reservations where user is the creator
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

      // Then, get all participant records for this user
      const participantRecords = await models.participant.findAll({
        where: { id_utilisateur: userId },
        attributes: ['id_reservation']
      });

      // Get unique reservation IDs where user is a participant
      const participantReservationIds = [...new Set(
        participantRecords.map(p => p.id_reservation)
      )];

      // Filter out IDs that are already in created reservations
      const createdIds = new Set(createdReservations.map(r => r.id));
      const additionalIds = participantReservationIds.filter(id => !createdIds.has(id));

      // Fetch additional reservations where user is participant but not creator
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

      // Combine and sort by date_creation DESC
      const allReservations = [...createdReservations, ...additionalReservations];
      allReservations.sort((a, b) => {
        const dateA = new Date(a.date_creation || 0);
        const dateB = new Date(b.date_creation || 0);
        return dateB - dateA;
      });

      return allReservations;
    } catch (err) {
      console.error('[findByUserId] Error:', err?.message, err);
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
  }

  const update = async (id, data) => {
    const reservation = await models.reservation.findByPk(id);
    if (!reservation) throw new Error("Reservation not found");
    await reservation.update(data);
    return await findById(id); // return with includes
  };

  const remove = async (id) => {
    const reservation = await models.reservation.findByPk(id);
    if (!reservation) throw new Error("Reservation not found");
    return await reservation.destroy();
  };

  // Find reservations by a specific date (YYYY-MM-DD)
  const findByDate = async (dateStr) => {
    return await models.reservation.findAll({
      where: { date: dateStr },
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plage_horaire' },
        { model: models.participant, as: 'participants' },
      ],
      order: [[ 'date', 'ASC' ]]
    });
  };

  // Find available (open) reservations by date: typer==2 and participants<4
  const findAvailableByDate = async (dateStr) => {
    const rows = await models.reservation.findAll({
      where: { date: dateStr },
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plage_horaire' },
        { model: models.participant, as: 'participants' },
      ],
      order: [[ 'date', 'ASC' ]]
    });
    return rows.filter((r) => {
      const typerVal = Number.parseInt((r.typer ?? 0).toString());
      const count = Array.isArray(r.participants) ? r.participants.length : 0;
      const isCancelled = Number(r.isCancel ?? 0) === 1;
      return typerVal === 2 && !isCancelled && count < 4;
    });
  };

  // Cancelation logic for open matches with 24h rule and creator/non-creator behavior
  const cancel = async (id, cancellingUserId) => {
    const t = await models.sequelize.transaction();
    try {
      console.log(`[CancelService] Start cancel id=${id}, user=${cancellingUserId}`);
      const reservation = await models.reservation.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!reservation) throw new Error('Reservation not found');

      // If already cancelled, short-circuit
      const currentIsCancel = Number(reservation.isCancel ?? 0);
      if (currentIsCancel === 1) {
        console.log('[CancelService] Reservation already cancelled');
        return reservation; // already cancelled
      }

      // Load related data
      const plage = reservation.id_plage_horaire
        ? await models.plage_horaire.findByPk(reservation.id_plage_horaire, { transaction: t, lock: t.LOCK.UPDATE })
        : null;
      const participants = await models.participant.findAll({
        where: { id_reservation: id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const typerVal = Number.parseInt((reservation.typer ?? 0).toString());
      const isOpenMatch = typerVal === 2;

      // Determine if cancellation is inside the 24h window before match start
      // Policy: Allow cancel only when NOW < (start - 24h). Block when NOW >= (start - 24h).
      let isInside24hWindow = false; // default: not inside window -> allow
      try {
        if (reservation.date && plage?.start_time) {
          const startDateTime = new Date(`${reservation.date}T${plage.start_time}`);
          const cutoff = new Date(startDateTime.getTime() - 24 * 60 * 60 * 1000);
          const now = new Date();
          // Inside 24h window if now is after cutoff and before start
          isInside24hWindow = now >= cutoff && now < startDateTime;
          console.log('[CancelService] timeCheck', {
            reservationDate: reservation.date,
            startTime: plage.start_time,
            startDateTime: startDateTime.toISOString(),
            cutoff: cutoff.toISOString(),
            now: now.toISOString(),
            isInside24hWindow,
          });
        }
      } catch (err) {
        console.warn('[CancelService] Failed time window check, default allow:', err?.message);
        isInside24hWindow = false; // allow when parsing fails
      }
      console.log('[CancelService] isOpenMatch=', isOpenMatch, 'participants=', participants.length, 'inside24hWindow=', isInside24hWindow);
      // Note: per business simplification, allow refund regardless of 24h window

      // Identify creator and whether canceller is creator
      const creatorParticipant = participants.find((p) => Boolean(p.est_createur));
      const isCancellerCreator = !!creatorParticipant && Number(creatorParticipant.id_utilisateur) === Number(cancellingUserId);
      console.log('[CancelService] isCancellerCreator=', isCancellerCreator);

      // Helpers
      // Base price for the slot (total).
      const slotPrice = (() => {
        const p = Number(plage?.price ?? reservation.prix_total ?? 0);
        return Number.isFinite(p) && p > 0 ? p : 0;
      })();
      
      console.log('[CancelService] slotPrice=', slotPrice, 'isOpenMatch=', isOpenMatch);

      // Refund helper
      const refundUser = async (userId, amount) => {
        if (!Number.isFinite(amount) || amount <= 0) {
          console.log(`[CancelService] Skipping refund for user ${userId} - invalid amount: ${amount}`);
          return;
        }
        const user = await models.utilisateur.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!user) {
          console.log(`[CancelService] User ${userId} not found for refund`);
          return;
        }
        const currentBalance = Number(user.credit_balance ?? 0);
        const newBalance = currentBalance + amount;
        await user.update({ credit_balance: newBalance }, { transaction: t });
        await logCreditTransaction(userId, amount, `refund:cancel:R${id}`, t);
        console.log(`[CancelService] Refunded user ${userId}: ${amount} credits (${currentBalance} -> ${newBalance})`);
      };

      // CASE A: Creator cancels -> cancel entire reservation, set etat=3, refund all paid players at FULL price, free slot
      if (isCancellerCreator) {
        console.log('[CancelService] CASE A: Creator cancels - refunding ALL participants who paid by credit');
        
        // Refund each participant who has already paid (statepaiement === 1)
        for (const p of participants) {
          // ════════════════════════════════════════════════════════════════════
          // FIXED: Refund based on statepaiement, NOT typepaiement
          // ════════════════════════════════════════════════════════════════════
          // - statepaiement = 1 means "already paid" → REFUND
          // - statepaiement = 0 means "not paid yet" → NO REFUND
          // 
          // This applies regardless of typepaiement (Crédit or Sur place)
          // If someone paid Sur place and statepaiement=1, they get refunded
          // ════════════════════════════════════════════════════════════════════
          const hasPaid = Number(p.statepaiement) === 1;
          
          if (!hasPaid) {
            console.log(`[CancelService] Skipping refund for user ${p.id_utilisateur} - not paid (statepaiement=${p.statepaiement}, typepaiement=${p.typepaiement})`);
            continue;
          }
          
          // Refund amount policy UPDATE: FULL slot price for ALL match types
          // - Regardless of typer (1: privé, 2: ouvert), refund FULL slot price per paid participant
          let amount = slotPrice;
          
          console.log(`[CancelService] Processing refund for user ${p.id_utilisateur}: amount=${amount}, isCreator=${p.est_createur}, isOpenMatch=${isOpenMatch}, slotPrice=${slotPrice}, typepaiement=${p.typepaiement}, statepaiement=${p.statepaiement}`);
          
          if (amount > 0) {
            await refundUser(p.id_utilisateur, amount);
          } else {
            console.log(`[CancelService] Skipping refund for user ${p.id_utilisateur} - amount is 0`);
          }
        }
        
        await reservation.update({ isCancel: 1, etat: 3, date_modif: new Date() }, { transaction: t });
        
        // Notify all participants except canceller
        for (const p of participants) {
          if (Number(p.id_utilisateur) === Number(cancellingUserId)) continue;
          addNotification({
            recipient_id: p.id_utilisateur,
            reservation_id: reservation.id,
            submitter_id: cancellingUserId,
            type: 'reservation_cancelled',
            message: 'Le créateur a annulé le match.'
          });
        }
        
        await models.participant.destroy({ where: { id_reservation: id }, transaction: t });
        
        if (plage) {
          await plage.update({ disponible: true }, { transaction: t });
        }
        
        await t.commit();
        console.log('[CancelService] CASE A completed - all refunds processed');
        
        return await models.reservation.findByPk(id, {
          include: [
            { model: models.terrain, as: 'terrain' },
            { model: models.utilisateur, as: 'utilisateur' },
            { model: models.plage_horaire, as: 'plage_horaire' },
          ]
        });
      }

      // CASE B: Non-creator cancels
      const cancellerParticipant = participants.find((p) => Number(p.id_utilisateur) === Number(cancellingUserId));
      if (!cancellerParticipant) {
        throw new Error('Cancelling user is not a participant of this reservation');
      }

      // Non-creator cancels: refund FULL price if they already paid (statepaiement === 1)
      console.log('[CancelService] CASE B: Non-creator cancels');
      
      // ════════════════════════════════════════════════════════════════════════
      // FIXED: Refund based on statepaiement, NOT typepaiement
      // ════════════════════════════════════════════════════════════════════════
      // - statepaiement = 1 means "already paid" → REFUND
      // - statepaiement = 0 means "not paid yet" → NO REFUND
      // ════════════════════════════════════════════════════════════════════════
      const hasPaid = Number(cancellerParticipant.statepaiement) === 1;
      
      if (hasPaid) {
        // Refund policy UPDATE: FULL slot price for ALL match types
        const refundAmount = slotPrice;
        
        console.log(`[CancelService] Refunding non-creator ${cancellingUserId}: amount=${refundAmount}, isOpenMatch=${isOpenMatch}, slotPrice=${slotPrice}, typepaiement=${cancellerParticipant.typepaiement}, statepaiement=${cancellerParticipant.statepaiement}`);
        
        if (refundAmount > 0) {
          await refundUser(cancellingUserId, refundAmount);
        }
      } else {
        console.log(`[CancelService] Non-creator ${cancellingUserId} has not paid yet (statepaiement=${cancellerParticipant.statepaiement}) - no refund needed`);
      }
      
      await models.participant.destroy({ where: { id_reservation: id, id_utilisateur: cancellingUserId }, transaction: t });
      
      // Keep reservation state consistent; if open match, keep it open (etat pending) else mark as modified
      await reservation.update({ date_modif: new Date() }, { transaction: t });
      
      for (const p of participants) {
        if (Number(p.id_utilisateur) === Number(cancellingUserId)) continue;
        addNotification({
          recipient_id: p.id_utilisateur,
          reservation_id: reservation.id,
          submitter_id: cancellingUserId,
          type: 'participant_cancelled',
          message: 'Un participant a quitté le match.'
        });
      }
      
      await t.commit();
      console.log('[CancelService] CASE B completed');
      
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
      console.error('[CancelService] Error during cancellation:', err?.message, err);
      throw err;
    }
  };

  // Process refunds based on reservation status and slot conflicts
  // - Refund all participants of reservations marked invalid (etat == 0)
  // - When a slot has a winning reservation (etat==1 OR open match with 4), refund participants from other reservations on the same slot
  // - Cleanup participants and reservation_utilisateur records after refund
  const processStatusRefunds = async () => {
    const t = await models.sequelize.transaction();
    try {
      console.log('[RefundService] Starting refund processor run');

      // Load all active reservations with includes for slot and participants
      const reservations = await models.reservation.findAll({
        where: { isCancel: 0 },
        include: [
          { model: models.plage_horaire, as: 'plage_horaire' },
          { model: models.participant, as: 'participants' },
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      // Group by slot id
      const bySlot = new Map();
      for (const r of reservations) {
        const slotId = Number(r.id_plage_horaire);
        if (!bySlot.has(slotId)) bySlot.set(slotId, []);
        bySlot.get(slotId).push(r);
      }

      // Helper to compute slot price
      const slotPriceOf = (r) => {
        const p = Number(r?.plage_horaire?.price ?? r?.prix_total ?? 0);
        return Number.isFinite(p) && p > 0 ? p : 0;
      };

      // 1) Refund for reservations explicitly invalid (etat == 0) — FULL price
      for (const r of reservations) {
        const etatVal = Number(r?.etat ?? -1);
        if (etatVal === 0 && Array.isArray(r.participants) && r.participants.length > 0) {
          const slotPrice = slotPriceOf(r);
          console.log('[RefundService] Invalid reservation detected -> refunding participants (FULL price)', { id: r.id, slotPrice });

          for (const p of r.participants) {
            const hasPaid = Number(p.statepaiement) === 1;
            if (!hasPaid) continue;
            const amount = slotPrice;
            await refundUserIdempotent(p.id_utilisateur, amount, r.id, p.id, t);
          }

          // Cleanup: remove participants and user-history links
          await models.participant.destroy({ where: { id_reservation: r.id }, transaction: t });
          await models.reservation_utilisateur.destroy({ where: { id_reservation: r.id }, transaction: t });
        }
      }

      // 2) For each slot: pick the winning reservation (valid one) and refund others at FULL price
      for (const [slotId, group] of bySlot.entries()) {
        // Determine winner: etat == 1 OR open match with exactly 4 participants
        let winner = null;
        for (const r of group) {
          const etatVal = Number(r?.etat ?? -1);
          const isOpen = Number(r?.typer ?? 0) === 2;
          const count = Array.isArray(r.participants) ? r.participants.length : 0;
          if (etatVal === 1 || (isOpen && count === 4)) {
            winner = r;
            break;
          }
        }
        if (!winner) continue;

        // Refund all participants from other reservations in the same slot — FULL price
        for (const r of group) {
          if (r.id === winner.id) continue;

          const slotPrice = slotPriceOf(r);
          console.log('[RefundService] Conflict refund (slot winner exists, FULL price)', { slotId, loserReservation: r.id, slotPrice });

          for (const p of r.participants) {
            const hasPaid = Number(p.statepaiement) === 1;
            if (!hasPaid) continue;
            const amount = slotPrice;
            await refundUserIdempotent(p.id_utilisateur, amount, r.id, p.id, t);
          }

          // Mark loser as invalid then cleanup participants/history
          await models.reservation.update({ etat: 0, date_modif: new Date() }, { where: { id: r.id }, transaction: t });
          await models.participant.destroy({ where: { id_reservation: r.id }, transaction: t });
          await models.reservation_utilisateur.destroy({ where: { id_reservation: r.id }, transaction: t });
        }
      }

      await t.commit();
      console.log('[RefundService] Refund processor run completed');
      return { processedSlots: bySlot.size };
    } catch (err) {
      await t.rollback();
      console.error('[RefundService] Refund processor run failed:', err?.message);
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
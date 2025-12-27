import { addNotification } from '../utils/notificationBus.js';

export default function ReservationService(models) {
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
    return await models.reservation.findAll({
      where: { id_utilisateur: userId },
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plage_horaire' },
        { model: models.participant, as: 'participants' }
      ],
      order: [[ 'date_creation', 'DESC' ]]
    });
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
      // Simplified refund policy: refund the slot price to the canceller's credit_balance
      const slotPrice = (() => {
        const p = Number(plage?.price ?? reservation.prix_total ?? 0);
        return Number.isFinite(p) && p > 0 ? p : 0;
      })();

      // Refund helper
      const refundUser = async (userId, amount) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const user = await models.utilisateur.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!user) return;
        const currentBalance = Number(user.credit_balance ?? 0);
        await user.update({ credit_balance: currentBalance + amount }, { transaction: t });
      };

      // CASE A: Creator cancels -> cancel entire reservation, set etat=3, refund all players, free slot
      if (isCancellerCreator) {
        console.log('[CancelService] CASE A: Creator cancels');
        // Refund the creator (canceller) with the slot price
        await refundUser(cancellingUserId, slotPrice);
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

      // Non-creator cancels: always refund canceller with slot price, then update reservation
      console.log('[CancelService] CASE B/C: Non-creator cancels');
      await refundUser(cancellingUserId, slotPrice);
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
      return await models.reservation.findByPk(id, {
        include: [
          { model: models.terrain, as: 'terrain' },
          { model: models.utilisateur, as: 'utilisateur' },
          { model: models.plage_horaire, as: 'plage_horaire' },
          { model: models.participant, as: 'participants' },
        ]
      });
      // (Removed fallback block: unified simplified behavior above)
    } catch (err) {
      await t.rollback();
      console.error('[CancelService] Error during cancellation:', err?.message, err);
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
  };
}

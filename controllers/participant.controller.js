// controllers/participant.controller.js
export default function ParticipantController(models) {
  const Participant = models.participant;
  

  const create = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
      const { id_reservation, id_utilisateur, est_createur, statepaiement, typepaiement } = req.body;
      // Support either 'teamIndex' from clients or 'team'
      const teamCandidate = (req.body.teamIndex !== undefined) ? req.body.teamIndex : req.body.team;

      if (!id_reservation) {
        await t.rollback();
        return res.status(400).json({ error: "Reservation ID is required" });
      }
      if (!id_utilisateur) {
        await t.rollback();
        return res.status(400).json({ error: "User ID is required" });
      }
      // Ensure team index is provided and valid (0..3)
      if (teamCandidate === undefined || teamCandidate === null) {
        await t.rollback();
        return res.status(400).json({ error: "Team index is required (0,1,2,3)" });
      }
      const teamIndex = Number(teamCandidate);
      if (!Number.isInteger(teamIndex) || teamIndex < 0 || teamIndex > 3) {
        await t.rollback();
        return res.status(400).json({ error: "Invalid team index. Must be 0,1,2, or 3" });
      }
      // ✅ Check if user already joined this reservation
      const existingParticipant = await Participant.findOne({
        where: { id_reservation, id_utilisateur },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (existingParticipant) {
        await t.rollback();
        return res.status(400).json({ error: "User is already a participant in this match" });
      }
      // ✅ Check if team slot already taken
      const existingSlot = await Participant.findOne({ where: { id_reservation, team: teamIndex }, transaction: t, lock: t.LOCK.UPDATE });
      if (existingSlot) {
        await t.rollback();
        return res.status(400).json({ error: `Team position ${teamIndex} is already taken` });
      }
      // ✅ Count participants for this reservation
      const currentParticipantsCount = await Participant.count({
        where: { id_reservation },
        transaction: t,
      });
      if (currentParticipantsCount >= 4) {
        await t.rollback();
        return res.status(400).json({
          error: "Cannot join match. Maximum of 4 players allowed per match panel.",
          currentPlayers: currentParticipantsCount,
          maxPlayers: 4
        });
      }
      // ✅ Rating range validation for open matches (typer === 2)
      // Fetch reservation and user note to validate if the joiner meets the required range
      const reservation = await models.reservation.findByPk(id_reservation, { transaction: t, lock: t.LOCK.UPDATE });
      if (!reservation) {
        await t.rollback();
        return res.status(404).json({ error: "Reservation not found" });
      }
      // Only enforce for open matches
      const typerVal = Number(reservation?.typer ?? 0);
      if (typerVal === 2) {
        const minInt = Number(reservation?.min);
        const maxInt = Number(reservation?.max);
        if (Number.isFinite(minInt) && Number.isFinite(maxInt)) {
          const minFloat = minInt / 10;
          const maxFloat = maxInt / 10;
          // Fetch the user's rating
          const user = await models.utilisateur.findByPk(id_utilisateur, { transaction: t, lock: t.LOCK.UPDATE });
          if (!user) {
            await t.rollback();
            return res.status(404).json({ error: "Utilisateur not found" });
          }
          const userNote = Number(user?.note ?? 0);

          if (userNote < minFloat || userNote > maxFloat) {
            // Non-blocking informational response: no charge, no participant created
            await t.rollback();
            return res.status(200).json({
              success: false,
              info: true,
              canJoin: false,
              message: `Your level ${userNote.toFixed(1)} is outside the required range [${minFloat.toFixed(1)} .. ${maxFloat.toFixed(1)}] for this match.`,
              code: "LEVEL_OUT_OF_RANGE",
              currentPlayers: currentParticipantsCount,
              maxPlayers: 4,
              spotsRemaining: Math.max(0, 4 - currentParticipantsCount)
            });
          }
        }
      }

      // ════════════════════════════════════════════════════════════════════════
      // FIXED: Properly handle statepaiement and typepaiement values
      // ════════════════════════════════════════════════════════════════════════
      // The bug was using `statepaiement || 1` which converts 0 to 1
      // because 0 is falsy in JavaScript!
      // 
      // Correct values:
      // - typepaiement: 1 = Crédit, 2 = Sur place
      // - statepaiement: 0 = not paid, 1 = paid
      // ════════════════════════════════════════════════════════════════════════
      
      // Use nullish coalescing (??) instead of logical OR (||)
      // This only defaults to 1 if the value is null or undefined, NOT if it's 0
      // Joining an open match: default to payment pending validation (0) and credit method (1)
      const finalStatePaiement = (statepaiement !== undefined && statepaiement !== null) 
        ? Number(statepaiement) 
        : 0;
      const finalTypePaiement = (typepaiement !== undefined && typepaiement !== null) 
        ? Number(typepaiement) 
        : 1;

      console.log(`[ParticipantController] Creating participant: statepaiement=${finalStatePaiement}, typepaiement=${finalTypePaiement} (raw: statepaiement=${statepaiement}, typepaiement=${typepaiement})`);

      // 🔐 Payment processing: deduct full slot price from user's credit and record transaction
      const plage = reservation.id_plage_horaire
        ? await models.plage_horaire.findByPk(reservation.id_plage_horaire, { transaction: t, lock: t.LOCK.UPDATE })
        : null;
      const slotPrice = (() => {
        const p = Number(plage?.price ?? reservation?.prix_total ?? 0);
        return Number.isFinite(p) && p > 0 ? p : 0;
      })();

      // Fetch user (again, if not previously fetched) to deduct balance
      const joiner = await models.utilisateur.findByPk(id_utilisateur, { transaction: t, lock: t.LOCK.UPDATE });
      if (!joiner) {
        await t.rollback();
        return res.status(404).json({ error: "Utilisateur not found" });
      }
      const currentBalance = Number(joiner.credit_balance ?? 0);
      if (!Number.isFinite(currentBalance) || currentBalance < slotPrice) {
        await t.rollback();
        return res.status(400).json({ error: "Insufficient credit balance" });
      }
      await joiner.update({ credit_balance: currentBalance - slotPrice }, { transaction: t });
      // Payment history audit
      await models.credit_transaction.create({
        id_utilisateur: id_utilisateur,
        nombre: -slotPrice,
        type: `debit:join:R${reservation.id}:U${id_utilisateur}:T${teamIndex}`,
        date_creation: new Date()
      }, { transaction: t });

      const participantData = {
        id_reservation,
        id_utilisateur,
        est_createur: est_createur || false,
        statepaiement: finalStatePaiement,  // ✅ FIXED: Now correctly handles 0
        typepaiement: finalTypePaiement,    // ✅ FIXED: Now correctly handles any value
        team: teamIndex
      };

      const result = await Participant.create(participantData, { transaction: t });

      const updatedCount = await Participant.count({ where: { id_reservation }, transaction: t });

      // If open match reaches 4 participants, mark reservation valid (etat=1)
      if (typerVal === 2 && updatedCount === 4) {
        await reservation.update({ etat: 1, date_modif: new Date() }, { transaction: t });
      }

      await t.commit();

      res.status(201).json({
        success: true,
        message: "Successfully joined the match",
        participant: result,
        currentPlayers: updatedCount,
        maxPlayers: 4,
        spotsRemaining: 4 - updatedCount
      });

    } catch (error) {
      console.error("Error creating participant:", error);
      try { await t.rollback(); } catch {}
      res.status(400).json({ error: error.message });
    }
  };

const findAll = async (req, res) => {
    try {
      const participants = await Participant.findAll({
        include: [{
          model: models.utilisateur,
          as: 'utilisateur',
          attributes: ['id', 'nom', 'prenom', 'email', 'numero_telephone']
        }]
      });
      res.json(participants);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const findById = async (req, res) => {
    try {
      const participant = await Participant.findByPk(req.params.id);
      if (!participant) return res.status(404).json({ error: "Participant not found" });
      res.json(participant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const update = async (req, res) => {
    try {
      const [updated] = await Participant.update(req.body, { where: { id: req.params.id } });
      if (!updated) return res.status(404).json({ error: "Participant not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const remove = async (req, res) => {
    try {
      const deleted = await Participant.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ error: "Participant not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const findByReservation = async (req, res) => {
    try {
      const participants = await Participant.findAll({
        where: { id_reservation: req.params.id_reservation },
        include: [{
          model: models.utilisateur,
          as: 'utilisateur',
          attributes: [
            'id',
            'nom',
            'prenom',
            'email',
            'numero_telephone',
            'image_url',
            'note',
            'mainprefere'
          ]
        }]
      });
      res.json(participants);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const checkReservationStatus = async (req, res) => {
    try {
      const count = await Participant.count({ where: { id_reservation: req.params.id_reservation } });
      res.json({
        reservationId: req.params.id_reservation,
        currentPlayers: count,
        maxPlayers: 4,
        spotsRemaining: 4 - count
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  return {
    create,
    findAll,
    findById,
    update,
    remove,
    findByReservation,
    checkReservationStatus
  };
}
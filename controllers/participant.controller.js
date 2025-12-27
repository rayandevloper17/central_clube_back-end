// controllers/participant.controller.js
export default function ParticipantController(models) {
  const Participant = models.participant;
  

  const create = async (req, res) => {
    try {
      const { id_reservation, id_utilisateur, est_createur, statepaiement, typepaiement } = req.body;
      // Support either 'teamIndex' from clients or 'team'
      const teamCandidate = (req.body.teamIndex !== undefined) ? req.body.teamIndex : req.body.team;

      if (!id_reservation) {
        return res.status(400).json({ error: "Reservation ID is required" });
      }
      if (!id_utilisateur) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Ensure team index is provided and valid (0..3)
      if (teamCandidate === undefined || teamCandidate === null) {
        return res.status(400).json({ error: "Team index is required (0,1,2,3)" });
      }
      const teamIndex = Number(teamCandidate);
      if (!Number.isInteger(teamIndex) || teamIndex < 0 || teamIndex > 3) {
        return res.status(400).json({ error: "Invalid team index. Must be 0,1,2, or 3" });
      }

      // ✅ Check if user already joined this reservation
      const existingParticipant = await Participant.findOne({
        where: { id_reservation, id_utilisateur }
      });

      if (existingParticipant) {
        return res.status(400).json({ error: "User is already a participant in this match" });
      }

      // ✅ Check if team slot already taken
      const existingSlot = await Participant.findOne({ where: { id_reservation, team: teamIndex } });
      if (existingSlot) {
        return res.status(400).json({ error: `Team position ${teamIndex} is already taken` });
      }

      // ✅ Count participants for this reservation
      const currentParticipantsCount = await Participant.count({
        where: { id_reservation }
      });

      if (currentParticipantsCount >= 4) {
        return res.status(400).json({
          error: "Cannot join match. Maximum of 4 players allowed per match panel.",
          currentPlayers: currentParticipantsCount,
          maxPlayers: 4
        });
      }

      // ✅ Rating range validation for open matches (typer === 2)
      // Fetch reservation and user note to validate if the joiner meets the required range
      const reservation = await models.reservation.findByPk(id_reservation);
      if (!reservation) {
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
          const user = await models.utilisateur.findByPk(id_utilisateur);
          if (!user) {
            return res.status(404).json({ error: "Utilisateur not found" });
          }
          const userNote = Number(user?.note ?? 0);

          if (userNote < minFloat || userNote > maxFloat) {
            return res.status(400).json({
              error: `You can't join: your level ${userNote.toFixed(1)} is outside the required range [${minFloat.toFixed(1)} .. ${maxFloat.toFixed(1)}]`
            });
          }
        }
      }

      // ✅ Create participant
      const participantData = {
        id_reservation,
        id_utilisateur,
        est_createur: est_createur || false,
        statepaiement: statepaiement || 1,
        typepaiement: typepaiement || 1,
        team: teamIndex
      };

      const result = await Participant.create(participantData);

      const updatedCount = await Participant.count({ where: { id_reservation } });

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

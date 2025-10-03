// controllers/participant.controller.js
export default function ParticipantController(models) {
  const Participant = models.participant;
  

  const create = async (req, res) => {
    try {
      const { id_reservation, id_utilisateur, est_createur, statepaiement, typepaiement } = req.body;

      if (!id_reservation) {
        return res.status(400).json({ error: "Reservation ID is required" });
      }
      if (!id_utilisateur) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // ✅ Check if user already joined this reservation
      const existingParticipant = await Participant.findOne({
        where: { id_reservation, id_utilisateur }
      });

      if (existingParticipant) {
        return res.status(400).json({ error: "User is already a participant in this match" });
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

      // ✅ Create participant
      const participantData = {
        id_reservation,
        id_utilisateur,
        est_createur: est_createur || false,
        statepaiement: statepaiement || 1,
        typepaiement: typepaiement || 1
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
        where: { id_reservation: req.params.id_reservation }
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

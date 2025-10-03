// services/participant.service.js
export default function ParticipantService(models) {
  const create = async (data) => {
    try {
      // Debugging info
      console.log('Models received:', Object.keys(models || {}));

      if (!models?.reservation) {
        throw new Error("Reservation model is not available");
      }
      if (!models?.utilisateur) {
        throw new Error("Utilisateur model is not available");
      }
      if (!models?.participant) {
        throw new Error("Participant model is not available");
      }

      // ✅ Check if reservation exists
      const reservation = await models.reservation.findByPk(data.id_reservation);
      if (!reservation) {
        throw new Error("Reservation not found");
      }

      // ✅ Check if utilisateur exists
      const utilisateur = await models.utilisateur.findByPk(data.id_utilisateur);
      if (!utilisateur) {
        throw new Error("Utilisateur not found");
      }

      // ✅ Create participant
      return await models.participant.create(data);
    } catch (error) {
      console.error('Error in ParticipantService.create:', error);
      throw error;
    }
  };

  const findAll = async () => {
    return await models.participant.findAll({
      include: [
        { model: models.reservation, as: 'reservation' },
        { model: models.utilisateur, as: 'utilisateur' },
      ],
    });
  };

  const findById = async (id) => {
    return await models.participant.findByPk(id, {
      include: [
        { model: models.reservation, as: 'reservation' },
        { model: models.utilisateur, as: 'utilisateur' },
      ],
    });
  };

  const update = async (id, data) => {
    const participant = await models.participant.findByPk(id);
    if (!participant) throw new Error("Participant not found");
    return await participant.update(data);
  };

  const remove = async (id) => {
    const participant = await models.participant.findByPk(id);
    if (!participant) throw new Error("Participant not found");
    return await participant.destroy();
  };

  return {
    create,
    findAll,
    findById,
    update,
    remove,
  };
}

// services/participant.service.js
export default function ParticipantService(models) {
  const create = async (data) => {
    // Check if match exists
    const match = await models.Match.findByPk(data.id_match);
    if (!match) {
      throw new Error("Match not found");
    }

    // Check if utilisateur exists
    const utilisateur = await models.Utilisateur.findByPk(data.id_utilisateur);
    if (!utilisateur) {
      throw new Error("Utilisateur not found");
    }

    // Then create participant
    return await models.Participant.create(data);
  };

  const findAll = async () => {
    return await models.Participant.findAll();
  };

  const findById = async (id) => {
    return await models.Participant.findByPk(id);
  };

  const update = async (id, data) => {
    const participant = await models.Participant.findByPk(id);
    if (!participant) throw new Error("Participant not found");
    return await participant.update(data);
  };

  const remove = async (id) => {
    const participant = await models.Participant.findByPk(id);
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

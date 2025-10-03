export default function ReservationService(models) {
  const create = async (data) => {
    const terrain = await models.terrain.findByPk(data.id_terrain);
    if (!terrain) throw new Error("Terrain not found");

    const utilisateur = await models.utilisateur.findByPk(data.id_utilisateur);
    if (!utilisateur) throw new Error("Utilisateur not found");

    const plage = await models.plage_horaire.findByPk(data.id_plage_horaire);
    if (!plage) throw new Error("Plage horaire not found");

    const reservation = await models.reservation.create(data);

    await plage.update({ disponible: false });

    // Return reservation with details
    return await models.reservation.findByPk(reservation.id, {
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plageHoraire' }
      ]
    });
  };

  const findAll = async () => {
    return await models.reservation.findAll({
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plageHoraire' }
      ]
    });
  };

  const findById = async (id) => {
    return await models.reservation.findByPk(id, {
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plageHoraire' }
      ]
    });
  };




const findOne = async (filter) => {
  return await models.reservation.findOne({
    where: filter,  
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plageHoraire' }
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

  return {
    create,
    findAll,
    findById,
    update,
    findOne,
    remove,
  };
}

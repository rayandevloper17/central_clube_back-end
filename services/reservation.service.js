export default function ReservationService(models) {
  const create = async (data) => {
    // Check foreign key: Terrain
    const terrain = await models.Terrain.findByPk(data.id_terrain);
    if (!terrain) throw new Error("Terrain not found");

    // Check foreign key: Utilisateur
    const utilisateur = await models.Utilisateur.findByPk(data.id_utilisateur);
    if (!utilisateur) throw new Error("Utilisateur not found");

    // Check foreign key: PlageHoraire
    const plage = await models.PlageHoraire.findByPk(data.id_plage_horaire);
    if (!plage) throw new Error("Plage horaire not found");

    // Create reservation
    return await models.Reservation.create(data);
  };

  const findAll = async () => {
    return await models.Reservation.findAll();
  };

  const findById = async (id) => {
    return await models.Reservation.findByPk(id);
  };

  const update = async (id, data) => {
    const reservation = await models.Reservation.findByPk(id);
    if (!reservation) throw new Error("Reservation not found");
    return await reservation.update(data);
  };

  const remove = async (id) => {
    const reservation = await models.Reservation.findByPk(id);
    if (!reservation) throw new Error("Reservation not found");
    return await reservation.destroy();
  };

  return {
    create,
    findAll,
    findById,
    update,
    remove,
  };
}

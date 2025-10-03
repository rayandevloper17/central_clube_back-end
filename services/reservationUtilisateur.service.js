export default function ReservationUtilisateurService(models) {
  const create = async (data) => {
    const utilisateur = await models.utilisateur.findByPk(data.id_utilisateur);
    if (!utilisateur) throw new Error("Utilisateur not found");

    const reservation = await models.reservation.findByPk(data.id_reservation);
    if (!reservation) throw new Error("Reservation not found");

    return await models.reservation_utilisateur.create(data);
  };

  const findAll = async () => {
    return await models.reservation_utilisateur.findAll();
  };

  const findById = async (id) => {
    return await models.reservation_utilisateur.findByPk(id);
  };

  const update = async (id, data) => {
    const record = await models.reservation_utilisateur.findByPk(id);
    if (!record) throw new Error("reservation_utilisateur not found");

    return await record.update(data);
  };

  const remove = async (id) => {
    const record = await models.reservation_utilisateur.findByPk(id);
    if (!record) throw new Error("reservation_utilisateur not found");

    return await record.destroy();
  };

  return {
    create,
    findAll,
    findById,
    update,
    remove,
  };
}

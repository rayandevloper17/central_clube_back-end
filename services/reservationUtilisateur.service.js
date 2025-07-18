export default function ReservationUtilisateurService(models) {
  const create = async (data) => {
    const utilisateur = await models.Utilisateur.findByPk(data.id_utilisateur);
    if (!utilisateur) throw new Error("Utilisateur not found");

    const reservation = await models.Reservation.findByPk(data.id_reservation);
    if (!reservation) throw new Error("Reservation not found");

    return await models.ReservationUtilisateur.create(data);
  };

  const findAll = async () => {
    return await models.ReservationUtilisateur.findAll();
  };

  const findById = async (id) => {
    return await models.ReservationUtilisateur.findByPk(id);
  };

  const update = async (id, data) => {
    const record = await models.ReservationUtilisateur.findByPk(id);
    if (!record) throw new Error("ReservationUtilisateur not found");

    return await record.update(data);
  };

  const remove = async (id) => {
    const record = await models.ReservationUtilisateur.findByPk(id);
    if (!record) throw new Error("ReservationUtilisateur not found");

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

export const createMatchService = async (models, data) => {
  const reservation = await models.reservation.findByPk(data.id_reservation);
  if (!reservation) throw new Error('Reservation not found');

  const match = await models.Match.create({
    id_reservation: data.id_reservation,
    id_createur: data.id_createur,
    type: data.type,
    cle_prive: data.cle_prive,
    nombre_joueurs: data.nombre_joueurs,
    etat: data.etat,
  });

  return match;
};

export const getAllMatchesService = async (models) => {
  return await models.Match.findAll();
};

export const getMatchByIdService = async (models, id) => {
  return await models.Match.findByPk(id);
};

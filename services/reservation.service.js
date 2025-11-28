export default function ReservationService(models) {
  const create = async (data) => {
    const terrain = await models.terrain.findByPk(data.id_terrain);
    if (!terrain) throw new Error("Terrain not found");

    const utilisateur = await models.utilisateur.findByPk(data.id_utilisateur);
    if (!utilisateur) throw new Error("Utilisateur not found");

    const plage = await models.plage_horaire.findByPk(data.id_plage_horaire);
    if (!plage) throw new Error("Plage horaire not found");

    // Normalize prix_total to satisfy DB constraint (check_prix_positif)
    // Prefer client-provided prix_total if valid (> 0); otherwise use plage.price; fallback to 1
    const incomingPrice = Number(data?.prix_total);
    const plagePrice = Number(plage?.price);
    const normalizedPrice = Number.isFinite(incomingPrice) && incomingPrice > 0
      ? incomingPrice
      : (Number.isFinite(plagePrice) && plagePrice > 0 ? plagePrice : 1);

    const payload = { ...data, prix_total: normalizedPrice };

    const reservation = await models.reservation.create(payload);

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

  const findByUserId = async (userId) => {
    return await models.reservation.findAll({
      where: { id_utilisateur: userId },
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plageHoraire' },
        { model: models.participant, as: 'participants' }
      ],
      order: [[ 'date_creation', 'DESC' ]]
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

  // NEW: Find reservations by DATEONLY (YYYY-MM-DD)
  const findByDate = async (dateStr) => {
    // Expect dateStr in 'YYYY-MM-DD'
    return await models.reservation.findAll({
      where: { date: dateStr },
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plageHoraire' },
        { model: models.participant, as: 'participants' },
      ],
      order: [[ { model: models.plage_horaire, as: 'plageHoraire' }, 'start_time', 'ASC' ]]
    });
  };

  // NEW: Find available (not full) reservations by date
  const findAvailableByDate = async (dateStr) => {
    const rows = await models.reservation.findAll({
      where: { date: dateStr },
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plageHoraire' },
        { model: models.participant, as: 'participants' },
      ],
      order: [[ { model: models.plage_horaire, as: 'plageHoraire' }, 'start_time', 'ASC' ]]
    });

    // Available means open matches (typer==2) with < 4 participants
    return rows.filter((r) => {
      const typerVal = Number.parseInt((r.typer ?? 0).toString());
      const count = Array.isArray(r.participants) ? r.participants.length : 0;
      return typerVal === 2 && count < 4;
    });
  };

  // NEW: Find all available (not full) reservations (any date)
  const findAvailableAll = async () => {
    const rows = await models.reservation.findAll({
      include: [
        { model: models.terrain, as: 'terrain' },
        { model: models.utilisateur, as: 'utilisateur' },
        { model: models.plage_horaire, as: 'plageHoraire' },
        { model: models.participant, as: 'participants' },
      ],
      order: [[ 'date', 'ASC' ], [ { model: models.plage_horaire, as: 'plageHoraire' }, 'start_time', 'ASC' ]]
    });
    return rows.filter((r) => {
      const typerVal = Number.parseInt((r.typer ?? 0).toString());
      const count = Array.isArray(r.participants) ? r.participants.length : 0;
      return typerVal === 2 && count < 4;
    });
  };

  return {
    create,
    findAll,
    findById,
    update,
    findByUserId,
    findOne,
    remove,
    findByDate,
    findAvailableByDate,
    findAvailableAll,
  };
}

export const createPlageHoraire = async (data, models) => {
  return await models.PlageHoraire.create(data);
};

export const getAllPlageHoraires = async (models) => {
  return await models.PlageHoraire.findAll();
};

export const getPlageHoraireById = async (id, models) => {
  return await models.PlageHoraire.findByPk(id);
};

export const updatePlageHoraire = async (id, data, models) => {
  const plage = await models.PlageHoraire.findByPk(id);
  if (!plage) throw new Error('PlageHoraire not found');
  return await plage.update(data);
};

export const deletePlageHoraire = async (id, models) => {
  const plage = await models.PlageHoraire.findByPk(id);
  if (!plage) throw new Error('PlageHoraire not found');
  return await plage.destroy();
};

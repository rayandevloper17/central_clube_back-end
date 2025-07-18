export const createPlageHoraire = async (data, { PlageHoraire }) => {
  return await PlageHoraire.create(data);
};

export const getAllPlageHoraires = async ({ PlageHoraire }) => {
  return await PlageHoraire.findAll();
};

export const getPlageHoraireById = async (id, { PlageHoraire }) => {
  return await PlageHoraire.findByPk(id);
};

export const updatePlageHoraire = async (id, data, { PlageHoraire }) => {
  const plageHoraire = await PlageHoraire.findByPk(id);
  if (!plageHoraire) throw new Error('Not Found');
  return await plageHoraire.update(data);
};

export const deletePlageHoraire = async (id, { PlageHoraire }) => {
  const plageHoraire = await PlageHoraire.findByPk(id);
  if (!plageHoraire) throw new Error('Not Found');
  return await plageHoraire.destroy();
};

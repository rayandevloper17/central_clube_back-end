const db = require("../models");
const creditTransaction = db.creditTransaction;

const create = async (data) => {
  return await creditTransaction.create(data);
};

const getAll = async () => {
  return await creditTransaction.findAll({ include: ["utilisateur"] });
};

const getById = async (id) => {
  return await creditTransaction.findByPk(id, { include: ["utilisateur"] });
};

const update = async (id, data) => {
  const transaction = await creditTransaction.findByPk(id);
  if (!transaction) throw new Error("Transaction not found");
  return await transaction.update(data);
};

const remove = async (id) => {
  const transaction = await creditTransaction.findByPk(id);
  if (!transaction) throw new Error("Transaction not found");
  return await transaction.destroy();
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};

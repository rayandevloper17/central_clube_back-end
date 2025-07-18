const db = require("../models");
const CreditTransaction = db.CreditTransaction;

const create = async (data) => {
  return await CreditTransaction.create(data);
};

const getAll = async () => {
  return await CreditTransaction.findAll({ include: ["utilisateur"] });
};

const getById = async (id) => {
  return await CreditTransaction.findByPk(id, { include: ["utilisateur"] });
};

const update = async (id, data) => {
  const transaction = await CreditTransaction.findByPk(id);
  if (!transaction) throw new Error("Transaction not found");
  return await transaction.update(data);
};

const remove = async (id) => {
  const transaction = await CreditTransaction.findByPk(id);
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

// controllers/creditTransaction.controller.js
export default function makeCreditTransactionController(models) {
  const { CreditTransaction } = models;

  return {
    async createCreditTransaction(req, res) {
      try {
        const creditTransaction = await CreditTransaction.create(req.body);
        res.status(201).json(creditTransaction);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },

    async getAllCreditTransactions(req, res) {
      try {
        const transactions = await CreditTransaction.findAll();
        res.json(transactions);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },

    async getCreditTransactionById(req, res) {
      try {
        const transaction = await CreditTransaction.findByPk(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Not found' });
        res.json(transaction);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },

    async updateCreditTransaction(req, res) {
      try {
        const [updated] = await CreditTransaction.update(req.body, {
          where: { id: req.params.id },
        });
        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Updated' });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },

    async deleteCreditTransaction(req, res) {
      try {
        const deleted = await CreditTransaction.destroy({
          where: { id: req.params.id },
        });
        if (!deleted) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },
  };
}

// routes/creditTransaction.routes.js
import express from 'express';
import makeCreditTransactionController from '../controllers/creditTransaction.controller.js';

export default function createCreditTransactionRoutes(models) {
  const router = express.Router();
  const controller = makeCreditTransactionController(models);

  router.post('/', controller.createCreditTransaction);
  router.get('/', controller.getAllCreditTransactions);
  router.get('/:id', controller.getCreditTransactionById);
  router.put('/:id', controller.updateCreditTransaction);
  router.delete('/:id', controller.deleteCreditTransaction);

  return router;
}

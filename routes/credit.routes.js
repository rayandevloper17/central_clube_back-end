// routes/credit.routes.js
import express from 'express';
import createCreditController from '../controllers/credit.controller.js';

export default (models) => {
  const router = express.Router();
  const creditController = createCreditController(models);

  // SSE endpoint for real-time credit balance updates
  router.get('/stream', creditController.streamCreditBalance);

  return router;
};
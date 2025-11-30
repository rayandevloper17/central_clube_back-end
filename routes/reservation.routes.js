// routes/reservations.js
import express from 'express';
import { authenticateToken as authenticate } from '../middlewares/auth.middleware.js';

export default function reservationRoutes(reservationController, notificationController) {
  const router = express.Router();

  // Existing routes
  router.post('/', authenticate, reservationController.create);
  router.get('/', authenticate, reservationController.findAll);
  router.get('/code/:code', authenticate, reservationController.findByCode);
  // router.get('/history/me', authenticate, reservationController.historyForUser); // Method not implemented
  router.get('/:id', authenticate, reservationController.findById);
  router.put('/:id', authenticate, reservationController.update);
  router.delete('/:id', authenticate, reservationController.remove);

  // NEW: Score management routes (commented out - methods not implemented yet)
  // router.put('/:id/score', authenticate, reservationController.updateScore);
  // router.post('/:id/validate-score', authenticate, reservationController.validateScore);
  // router.get('/:id/score-status', authenticate, reservationController.getScoreStatus);
  // router.post('/finalize-pending-scores', authenticate, reservationController.finalizePendingScores);

  return router;
}

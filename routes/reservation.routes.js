// routes/reservations.js
import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';

export default function reservationRoutes(reservationController, notificationController) {
  const router = express.Router();

  // Existing routes
  router.post('/', authenticateToken, reservationController.create);
  router.get('/', authenticateToken, reservationController.findAll);
  router.get('/code/:code', authenticateToken, reservationController.findByCode);
  router.get('/history/me', authenticateToken, reservationController.historyForUser); // Get user-specific reservations
  router.get('/:id', authenticateToken, reservationController.findById);
  router.put('/:id', authenticateToken, reservationController.update);
  router.delete('/:id', authenticateToken, reservationController.remove);

  // NEW: Score management routes (commented out - methods not implemented yet)
  // router.put('/:id/score', authenticateToken, reservationController.updateScore);
  // router.post('/:id/validate-score', authenticateToken, reservationController.validateScore);
  // router.get('/:id/score-status', authenticateToken, reservationController.getScoreStatus);
  // router.post('/finalize-pending-scores', authenticateToken, reservationController.finalizePendingScores);

  // Remove any endpoint that allows querying by user_id or exposes other users' data

  return router;
}

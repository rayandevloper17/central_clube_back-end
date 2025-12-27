// routes/reservations.js
import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

export default function reservationRoutes(reservationController, notificationController) {
  const router = express.Router();

  // Existing routes
  router.post('/', authenticateToken, reservationController.create);
  // Admin-only: list all reservations
  router.get('/', authenticateToken, requireAdmin, reservationController.findAll);
  // Public (authenticated) date-based queries
  router.get('/date/:date', authenticateToken, reservationController.findByDate);
  router.get('/available/date/:date', authenticateToken, reservationController.findAvailableByDate);
  // Current user reservations
  router.get('/me', authenticateToken, reservationController.findMine);
  router.get('/code/:code', authenticateToken, reservationController.findByCode);
  // router.get('/history/me', authenticateToken, reservationController.historyForUser); // DISABLED - method not implemented
  router.get('/:id', authenticateToken, reservationController.findById);
  router.put('/:id', authenticateToken, reservationController.update);
  router.put('/:id/cancel', authenticateToken, reservationController.cancel);
  router.delete('/:id', authenticateToken, reservationController.remove);

  // NEW: Score management routes (DISABLED - methods not implemented yet)
  // router.put('/:id/score', authenticateToken, reservationController.updateScore);
  // router.post('/:id/validate-score', authenticateToken, reservationController.validateScore);
  // router.get('/:id/score-status', authenticateToken, reservationController.getScoreStatus);
  // router.post('/finalize-pending-scores', authenticateToken, reservationController.finalizePendingScores);

  return router;
}

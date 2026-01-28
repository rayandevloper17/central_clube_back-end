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
  router.get('/me', authenticateToken, (req, res) => {
    // Create a modified request object with userId from the authenticated user
    const modifiedReq = {
      ...req,
      params: { ...req.params, userId: req.user.id }
    };
    return reservationController.findByUserId(modifiedReq, res);
  });
  // router.get('/code/:code', authenticateToken, reservationController.findByCode); // DISABLED - method not implemented
  // router.get('/history/me', authenticateToken, reservationController.historyForUser); // DISABLED - method not implemented
  router.get('/:id', authenticateToken, reservationController.findById);
  router.put('/:id', authenticateToken, reservationController.update);
  router.put('/:id/cancel', authenticateToken, reservationController.cancel);
  router.delete('/:id', authenticateToken, reservationController.remove);

  // NEW: Score management routes
  router.put('/:id/score', authenticateToken, reservationController.updateScore);
  router.post('/finalize-pending-scores', authenticateToken, reservationController.finalizePendingScores);
  // router.post('/:id/validate-score', authenticateToken, reservationController.validateScore); // Deprecated by updateScore
  // router.get('/:id/score-status', authenticateToken, reservationController.getScoreStatus);

  // NEW: Membership-based reservation endpoints
  router.get('/date-range/:userId/:clubId', authenticateToken, reservationController.getDateRange);
  router.get('/can-create-open/:userId/:clubId', authenticateToken, reservationController.canCreateOpenMatch);
  router.post('/validate-cancellation', authenticateToken, reservationController.validateCancellation);

  return router;
}

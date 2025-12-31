import { Router } from 'express';
import ReservationUtilisateurService from '../services/reservationUtilisateur.service.js';
import ReservationUtilisateurController from '../controllers/reservationUtilisateur.controller.js';

export default function ReservationUtilisateurRoutes(models) {
  const router = Router();
  const service = ReservationUtilisateurService(models);
  const controller = ReservationUtilisateurController(service);

  // IMPORTANT: Put specific routes BEFORE parameterized routes
  // Otherwise /:id will catch /me, /code, etc.

  // Specific routes first
  router.get('/me', controller.findByCurrentUser);  // Get current user's reservations
  router.get('/code/:code', controller.findByCode);  // Search by code
  router.get('/available/date/:date', controller.findAvailableByDate);  // Available by date
  router.get('/date/:date', controller.findByDate);  // All by date

  // Cancel route - MUST be before /:id to avoid conflict
  router.put('/:id/cancel', controller.cancel);

  // Generic CRUD routes
  router.post('/', controller.create);
  router.get('/', controller.findAll);
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
import { Router } from 'express';
import ReservationUtilisateurService from '../services/reservationUtilisateur.service.js';
import ReservationUtilisateurController from '../controllers/reservationUtilisateur.controller.js';

export default function ReservationUtilisateurRoutes(models) {
  const router = Router();
  const service = ReservationUtilisateurService(models);
  const controller = ReservationUtilisateurController(service);

  router.post('/', controller.create);
  router.get('/', controller.findAll);
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

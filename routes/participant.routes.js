// routes/participant.routes.js
import express from 'express';
import ParticipantController from '../controllers/participant.controller.js';

export default function createParticipantRoutes(models) {
  const router = express.Router();
  const controller = ParticipantController(models);

  router.post('/', controller.create);
  router.get('/', controller.findAll);
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  router.get('/reservation/:id_reservation', controller.findByReservation);
  router.get('/reservations/:id_reservation/status', controller.checkReservationStatus);

  return router;
}

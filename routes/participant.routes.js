// routes/participant.routes.js
import express from 'express';
import ParticipantService from '../services/participant.service.js';
import ParticipantController from '../controllers/participant.controller.js';

export default function createParticipantRoutes(models) {
  const router = express.Router();
  const service = ParticipantService(models);
  const controller = ParticipantController(service);

  router.post('/', controller.create);
  router.get('/', controller.findAll);
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
    
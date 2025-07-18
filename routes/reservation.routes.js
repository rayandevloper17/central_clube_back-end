import express from 'express';

export default function ReservationRoutes(controller) {
  const router = express.Router();

  router.post('/', controller.create);
  router.get('/', controller.findAll);
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

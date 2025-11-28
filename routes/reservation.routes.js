import express from 'express';

export default function ReservationRoutes(controller) {
  const router = express.Router();
  

  router.post('/', controller.create);
  router.get('/', controller.findAll);
  // User reservation history
  router.get('/history/me', controller.historyForMe);
  // Specific routes first to avoid param route swallowing them
  router.get('/date/:date', controller.findByDate);
  router.get('/available/date/:date', controller.findAvailableByDate);
  router.get('/available/all', controller.findAvailableAll);
  router.get('/code/:code', controller.findByCode);

  // Parameterized routes
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);


  return router;
}

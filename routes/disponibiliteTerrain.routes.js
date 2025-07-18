import express from 'express';
import * as controller from '../controllers/disponibiliteTerrain.controller.js';

export default function createDisponibiliteTerrainRoutes(models) {
  const router = express.Router();

  // Inject models
  router.use((req, res, next) => {
    req.models = models;
    next();
  });

  router.post('/', controller.createDisponibilite);
  router.get('/', controller.getAllDisponibilites);
  router.get('/:id', controller.getDisponibiliteById);
  router.put('/:id', controller.updateDisponibilite);
  router.delete('/:id', controller.deleteDisponibilite);

  return router;
}

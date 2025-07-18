import express from 'express';
import createTerrainController from '../controllers/terrain.controller.js';
import createTerrainService from '../services/terrain.service.js';

export default (models) => {
  const router = express.Router();
  const terrainService = createTerrainService(models);
  const terrainController = createTerrainController(terrainService);

  router.post('/', terrainController.createTerrain);
  router.get('/', terrainController.getAllTerrains);
  router.get('/:id', terrainController.getTerrainById);
  router.put('/:id', terrainController.updateTerrain);
  router.delete('/:id', terrainController.deleteTerrain);

  return router;
};

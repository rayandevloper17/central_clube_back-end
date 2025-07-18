import express from 'express';
import {
  createPlageHoraire,
  getAllPlageHoraires,
  getPlageHoraireById,
  updatePlageHoraire,
  deletePlageHoraire
} from '../controllers/plageHoraire.controller.js';

const createPlageHoraireRoutes = (models) => {
  const router = express.Router();

  router.use((req, res, next) => {
    req.models = models;
    next();
  });

  router.post('/', createPlageHoraire);
  router.get('/', getAllPlageHoraires);
  router.get('/:id', getPlageHoraireById);
  router.put('/:id', updatePlageHoraire);
  router.delete('/:id', deletePlageHoraire);

  return router;
};

export default createPlageHoraireRoutes;

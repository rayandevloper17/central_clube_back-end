import express from 'express';
import { createMatch, getAllMatches, getMatchById } from '../controllers/matchController.js';

const router = express.Router();

export default (models) => {
  router.use((req, res, next) => {
    req.models = models;
    next();
  });

  router.post('/', createMatch);
  router.get('/', getAllMatches);
  router.get('/:id', getMatchById);

  return router;
};

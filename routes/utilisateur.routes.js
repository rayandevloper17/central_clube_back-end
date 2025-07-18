// routes/utilisateur.routes.js
import express from 'express';
import utilisateurController from '../controllers/utilisateur.controller.js';
import { validateCreateUser, validateUpdateUser } from '../middlewares/utilisateur.middleware.js';

export default (models) => {
  const router = express.Router();
  const ctrl = utilisateurController(models);

  router.get('/', ctrl.getAll);
  router.get('/:id', ctrl.getById);
  router.post('/', validateCreateUser, ctrl.create);
  router.put('/:id', validateUpdateUser, ctrl.update);
  router.delete('/:id', ctrl.delete);

  return router;
};

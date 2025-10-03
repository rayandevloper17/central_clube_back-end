// routes/utilisateur.routes.js
import express from 'express';
import createUtilisateurController from '../controllers/utilisateur.controller.js';
import { authenticateToken, authorizeUser } from '../middlewares/auth.middleware.js';
import { validateCreditUpdate } from '../middlewares/utilisateur.middleware.js';

import { 
  validateCreateUser, 
  validateUpdateUser, 
  validateLogin,
  validateId 
} from '../middlewares/utilisateur.middleware.js';

export default (models) => {
  const router = express.Router();
const utilisateurController = createUtilisateurController(models);

// 🔓 PUBLIC ROUTES (no authentication needed)
  router.post('/register', validateCreateUser, utilisateurController.create);
  router.post('/login', validateLogin, utilisateurController.login);
  router.post('/refresh-token', utilisateurController.refreshToken);
  router.post('/logout', utilisateurController.logout);

  // 🔒 PROTECTED ROUTES (authentication required)
  // Get all users (admin only or for selection purposes)
  router.get('/', authenticateToken, utilisateurController.getAll);
  
  // Get user by ID (users can only access their own data)
  router.get('/:id', authenticateToken, validateId, authorizeUser, utilisateurController.getById);
  
  // Update user (users can only update their own data)11
  router.put('/:id', authenticateToken, validateId, validateUpdateUser, authorizeUser, utilisateurController.update);
  
  // Delete user (users can only delete their own account)
  router.delete('/:id', authenticateToken, validateId, authorizeUser, utilisateurController.delete);

  // 🔒 ADDITIONAL PROTECTED ROUTES
  // Get current user profile (based on token)
  router.get('/profile/me', authenticateToken, (req, res, next) => {
    req.params.id = req.user.id.toString();
    utilisateurController.getById(req, res, next);
  });




  // Update current user profile (based on token)
  router.put('/profile/me', authenticateToken, validateUpdateUser, (req, res, next) => {
    req.params.id = req.user.id.toString();
    utilisateurController.update(req, res, next);
  });

  // Add this to your routes file temporarily

  return router;
};
// routes/utilisateur.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

  // ✅ Upload current user's profile picture
  // Uses multer to store the file in the server's /uploads directory
  // and updates utilisateur.image_url with a publicly accessible URL
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `profile-${uniqueSuffix}${ext}`);
    },
  });
  const upload = multer({ storage });

  router.post(
    '/profile/me/profile-picture',
    authenticateToken,
    upload.single('image'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ success: false, message: 'Aucun fichier envoyé (champ "image" requis)' });
        }

        // Debug: request details
        console.log(`${new Date().toISOString()} - POST /api/utilisateurs/profile/me/profile-picture`, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          hasAuth: !!req.user,
          file: { filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size },
        });

        const userId = req.user.id;
        const user = await models.utilisateur.findByPk(userId);
        if (!user) {
          return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Build full public URL using environment or forwarded headers
        // Prefer PUBLIC_BASE_URL if set; otherwise use X-Forwarded headers or req protocol/host
        const envBase = process.env.PUBLIC_BASE_URL;
        const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString();
        const host = (req.headers['x-forwarded-host'] || req.get('host') || '').toString();
        const inferredBase = `${proto}://${host}`;
        const publicBase = (envBase && envBase.trim().length > 0) ? envBase.trim().replace(/\/+$/,'') : inferredBase.replace(/\/+$/,'');
        const relativePath = `/uploads/${req.file.filename}`;
        const fullPublicUrl = `${publicBase}${relativePath}`;

        await user.update({ image_url: fullPublicUrl, date_misajour: new Date() });

        return res.status(200).json({
          success: true,
          message: 'Photo de profil envoyée et mise à jour avec succès',
          image_url: fullPublicUrl,
          path: relativePath,
          filename: req.file.filename,
        });
      } catch (err) {
        console.error('❌ Erreur upload photo profil:', err);
        return res.status(500).json({ success: false, message: err.message });
      }
    }
  );

  return router;
};
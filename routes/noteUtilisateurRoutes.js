// routes/noteUtilisateurRoutes.js

import express from 'express';
import createNoteUtilisateurService from '../services/noteUtilisateurService.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

export default function createNoteUtilisateurRoutes(models) {
  const router = express.Router();
  const noteUtilisateurService = createNoteUtilisateurService(models);

  // POST /api/notes - Protected route
  // Store rating directly in utilisateur.note and mark questionnaire as completed
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { note, id_utilisateur } = req.body;

      if (note === undefined) {
        return res.status(400).json({ error: "note is required" });
      }

      const parsedNote = typeof note === 'number' ? note : parseFloat(note);
      if (Number.isNaN(parsedNote)) {
        return res.status(400).json({ error: "note must be a valid number" });
      }

      // Target user: provided id or the authenticated user
      const targetUserId = id_utilisateur || req.user?.id;
      if (!targetUserId) {
        return res.status(400).json({ error: "id_utilisateur is required or must be authenticated" });
      }

      const user = await models.utilisateur.findByPk(targetUserId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      // Save rating in user record
      user.note = parsedNote;
      // Mark both flags to hide the questionnaire
      user.questionnaire_note_rempli = 1;
      user.displayQ = 1;
      await user.save();

      return res.status(200).json({
        message: 'Note enregistrée avec succès',
        user,
      });
    } catch (err) {
      console.error('Create Note Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/notes
  router.get('/', async (req, res) => {
    try {
      const notes = await noteUtilisateurService.getAllNotes();
      res.json(notes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/notes/user/:userId
  // Updated: return the utilisateur details with rating and display flag
  router.get('/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await models.utilisateur.findByPk(userId, {
        attributes: ['id', 'nom', 'prenom', 'email', 'image_url', 'note', ]
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      return res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/notes/:id
  router.get('/:id', async (req, res) => {
    try {
      const note = await noteUtilisateurService.getNoteById(req.params.id);
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json(note);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/notes/:id
  router.delete('/:id', async (req, res) => {
    try {
      await noteUtilisateurService.deleteNote(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}

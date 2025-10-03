// routes/noteUtilisateurRoutes.js

import express from 'express';
import createNoteUtilisateurService from '../services/noteUtilisateurService.js';

export default function createNoteUtilisateurRoutes(models) {
  const router = express.Router();
  const noteUtilisateurService = createNoteUtilisateurService(models);

  // POST /api/notes
  router.post('/', async (req, res) => {
    try {
      const note = await noteUtilisateurService.createNote(req.body);
      res.status(201).json(note);
    } catch (err) {
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

  // GET /api/notes/:id
  router.get('/:id', async (req, res) => {
    try {
      const note = await noteUtilisateurService.getNoteById(req.params.id);
      res.json(note);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });
    // GET /api/notes/user/:userId
    router.get('/user/:userId', async (req, res) => {
      try {
        const notes = await noteUtilisateurService.getNotesByUserId(req.params.userId);
        res.json(notes);
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

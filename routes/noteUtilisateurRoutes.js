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

  return router;
}

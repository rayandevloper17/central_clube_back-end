// controllers/noteUtilisateurController.js
import NoteUtilisateur from '../models/noteUtilisateur.js';

export const createNote = async (req, res) => {
  try {
    const { id_match, id_noteur, id_notee, note } = req.body;

    if (!id_match || !id_noteur || !id_notee || !note) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newNote = await NoteUtilisateur.create({ id_match, id_noteur, id_notee, note });
    res.status(201).json({ message: 'Note created successfully', note: newNote });
  } catch (err) {
    console.error('Create Note Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllNotes = async (req, res) => {
  try {
    const notes = await NoteUtilisateur.findAll();
    res.status(200).json(notes);
  } catch (err) {
    console.error('Get All Notes Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await NoteUtilisateur.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.status(200).json(note);
  } catch (err) {
    console.error('Get Note Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await NoteUtilisateur.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await note.destroy();
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Delete Note Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

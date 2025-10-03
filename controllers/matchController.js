import { createMatchService, getAllMatchesService, getMatchByIdService } from '../services/matchService.js';

export const createMatch = async (req, res) => {
  try {
    const match = await createMatchService(req.models, req.body);
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllMatches = async (req, res) => {
  try {
    const matches = await getAllMatchesService(req.models);
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const match = await getMatchByIdService(req.models, req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

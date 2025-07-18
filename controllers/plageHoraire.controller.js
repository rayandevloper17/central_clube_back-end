import * as service from '../services/plageHoraire.service.js';

export const createPlageHoraire = async (req, res) => {
  try {
    const result = await service.createPlageHoraire(req.body, req.models);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllPlageHoraires = async (req, res) => {
  try {
    const result = await service.getAllPlageHoraires(req.models);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPlageHoraireById = async (req, res) => {
  try {
    const result = await service.getPlageHoraireById(req.params.id, req.models);
    if (!result) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePlageHoraire = async (req, res) => {
  try {
    const result = await service.updatePlageHoraire(req.params.id, req.body, req.models);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deletePlageHoraire = async (req, res) => {
  try {
    const result = await service.deletePlageHoraire(req.params.id, req.models);
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

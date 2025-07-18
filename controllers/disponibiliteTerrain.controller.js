import * as service from '../services/disponibiliteTerrain.service.js';

export const createDisponibilite = async (req, res) => {
  try {
    const result = await service.createDisponibilite(req.body, req.models);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllDisponibilites = async (req, res) => {
  try {
    const result = await service.getAllDisponibilites(req.models);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDisponibiliteById = async (req, res) => {
  try {
    const result = await service.getDisponibiliteById(req.params.id, req.models);
    if (!result) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateDisponibilite = async (req, res) => {
  try {
    const result = await service.updateDisponibilite(req.params.id, req.body, req.models);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteDisponibilite = async (req, res) => {
  try {
    const result = await service.deleteDisponibilite(req.params.id, req.models);
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

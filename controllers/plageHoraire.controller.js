import * as service from '../services/plageHoraire.service.js';

export const createPlageHoraire = async (req, res) => {
  try {
    // Validate required fields
    const { start_time, end_time, price, terrain_id } = req.body;
    
    if (!start_time || !end_time || !price || !terrain_id) {
      return res.status(400).json({ 
        message: 'Missing required fields: start_time, end_time, price, terrain_id' 
      });
    }

    const result = await service.createPlageHoraire(req.body, req.models);
    res.status(201).json({
      success: true,
      message: 'PlageHoraire created successfully',
      data: result
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getAllPlageHoraires = async (req, res) => {
  try {
    const { terrain_id, type, disponible } = req.query;
    const filters = {};
    
    if (terrain_id) filters.terrain_id = terrain_id;
    if (type !== undefined) filters.type = parseInt(type);
    if (disponible !== undefined) filters.disponible = disponible === 'true';

    const result = await service.getAllPlageHoraires(req.models, filters);
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getPlageHoraireById = async (req, res) => {
  try {
    const result = await service.getPlageHoraireById(req.params.id, req.models);
    if (!result) {
      return res.status(404).json({ 
        success: false,
        message: 'PlageHoraire not found' 
      });
    }
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getPlageHorairesByTerrain = async (req, res) => {
  try {
    const { terrain_id } = req.params;
    const { disponible, type } = req.query;
    
    const filters = { terrain_id };
    if (disponible !== undefined) filters.disponible = disponible === 'true';
    if (type !== undefined) filters.type = parseInt(type);

    const result = await service.getPlageHorairesByTerrain(terrain_id, req.models, filters);
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const updatePlageHoraire = async (req, res) => {
  try {
    const result = await service.updatePlageHoraire(req.params.id, req.body, req.models);
    res.status(200).json({
      success: true,
      message: 'PlageHoraire updated successfully',
      data: result
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const { disponible } = req.body;
    
    if (disponible === undefined) {
      return res.status(400).json({
        success: false,
        message: 'disponible field is required'
      });
    }

    const result = await service.updatePlageHoraireAvailability(req.params.id, disponible, req.models);
    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: result
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const deletePlageHoraire = async (req, res) => {
  try {
    await service.deletePlageHoraire(req.params.id, req.models);
    res.status(200).json({ 
      success: true,
      message: 'PlageHoraire deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { terrain_id } = req.params;
    const { type } = req.query;
    
    const filters = { disponible: true };
    if (type !== undefined) filters.type = parseInt(type);

    const result = await service.getPlageHorairesByTerrain(terrain_id, req.models, filters);
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};
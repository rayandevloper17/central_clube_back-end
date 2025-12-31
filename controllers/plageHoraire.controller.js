// ════════════════════════════════════════════════════════════════════════════════
// plageHoraire.controller.js - FIXED: Pass date to service for filtering
// ════════════════════════════════════════════════════════════════════════════════

import * as service from '../services/plageHoraire.service.js';

export const createPlageHoraire = async (req, res) => {
  try {
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

// ════════════════════════════════════════════════════════════════════════════════
// MAIN ENDPOINT - Filter by terrain AND date
// ════════════════════════════════════════════════════════════════════════════════
export const getPlageHorairesByTerrain = async (req, res) => {
  try {
    const { terrain_id } = req.params;
    const { disponible, type, date } = req.query;
    
    console.log(`\n🔍 ════════════════════════════════════════════════════════════`);
    console.log(`🔍 getPlageHorairesByTerrain`);
    console.log(`   📍 terrain_id: ${terrain_id}`);
    console.log(`   📅 date: ${date || 'NOT PROVIDED'}`);
    console.log(`   ✓ disponible: ${disponible}`);
    console.log(`   🏷️ type: ${type}`);
    console.log(`🔍 ════════════════════════════════════════════════════════════\n`);
    
    // ════════════════════════════════════════════════════════════════════
    // CRITICAL: Pass date to service for filtering by start_time date
    // ════════════════════════════════════════════════════════════════════
    const filters = {};
    if (type !== undefined) filters.type = parseInt(type);
    if (date) filters.date = date;  // Pass date to service!
    
    // Get slots filtered by terrain AND date
    let result = await service.getPlageHorairesByTerrain(terrain_id, req.models, filters);
    
    console.log(`📋 Service returned ${result.length} slots for terrain ${terrain_id}, date ${date || 'all'}`);
    
    // Apply disponible filter if specified
    if (disponible !== undefined) {
      const filterValue = disponible === 'true';
      result = result.filter(slot => slot.disponible === filterValue);
      console.log(`🔽 After disponible=${filterValue} filter: ${result.length} slots`);
    }
    
    // Log the slots being returned
    result.forEach(slot => {
      console.log(`   📍 Slot ${slot.id}: ${slot.start_time}-${slot.end_time} | disponible=${slot.disponible} | price=${slot.price}`);
    });
    
    console.log(`\n✅ Returning ${result.length} slots\n`);
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (err) {
    console.error(`❌ Error:`, err.message);
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
    const { type, date } = req.query;
    
    const filters = { disponible: true };
    if (type !== undefined) filters.type = parseInt(type);
    if (date) filters.date = date;

    const result = await service.getPlageHorairesByTerrain(terrain_id, req.models, filters);
    
    // Filter only available slots
    const availableSlots = result.filter(slot => slot.disponible === true);
    
    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};
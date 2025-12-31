// ════════════════════════════════════════════════════════════════════════════════
// plageHoraire.service.js - FIXED: Filter by date from start_time TIMESTAMP
// ════════════════════════════════════════════════════════════════════════════════
//
// DISCOVERY: start_time and end_time are TIMESTAMP (not TIME)!
// Example: start_time = "2026-01-03 08:00:00"
//
// So the date IS stored in start_time, we just need to filter by it!
// ════════════════════════════════════════════════════════════════════════════════

import { Op, Sequelize } from 'sequelize';

export const createPlageHoraire = async (data, models) => {
  try {
    if (!models.plage_horaire) {
      throw new Error('PlageHoraire model not found in models object');
    }

    if (data.terrain_id && models.terrain) {
      const terrain = await models.terrain.findByPk(data.terrain_id);
      if (!terrain) {
        throw new Error('Terrain not found');
      }
    }

    const plageHoraireData = {
      ...data,
      disponible: data.disponible !== undefined ? data.disponible : true,
      type: data.type || null
    };

    return await models.plage_horaire.create(plageHoraireData);
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const getAllPlageHoraires = async (models, filters = {}) => {
  try {
    const whereClause = {};
    
    if (filters.terrain_id) whereClause.terrain_id = filters.terrain_id;
    if (filters.type !== undefined) whereClause.type = filters.type;
    if (filters.disponible !== undefined) whereClause.disponible = filters.disponible;

    const includeOptions = [];
    
    if (models.terrain) {
      includeOptions.push({
        model: models.terrain,
        as: 'terrain',
        attributes: ['id', 'name', 'type']
      });
    }

    const results = await models.plage_horaire.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['start_time', 'ASC']]
    });

    return formatTimeResults(results);
  } catch (error) {
    console.error('Service error', error);
    throw error;
  }
};

export const getPlageHoraireById = async (id, models) => {
  try {
    const includeOptions = [];
    
    if (models.terrain) {
      includeOptions.push({
        model: models.terrain,
        as: 'terrain',
        attributes: ['id', 'name', 'type']
      });
    }

    return await models.plage_horaire.findByPk(id, {
      include: includeOptions
    });
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════════════════════
// MAIN FIX: Filter slots by DATE extracted from start_time TIMESTAMP
// ════════════════════════════════════════════════════════════════════════════════
export const getPlageHorairesByTerrain = async (terrain_id, models, additionalFilters = {}) => {
  try {
    const whereClause = { terrain_id };
    
    // Add type filter if provided
    if (additionalFilters.type !== undefined) {
      whereClause.type = additionalFilters.type;
    }

    // ════════════════════════════════════════════════════════════════════
    // CRITICAL FIX: Filter by DATE from start_time timestamp
    // ════════════════════════════════════════════════════════════════════
    if (additionalFilters.date) {
      const dateStr = additionalFilters.date; // Format: "2025-12-31" or "2026-01-01"
      
      console.log(`🔍 Filtering by date: ${dateStr}`);
      
      // Create date range for the entire day
      const startOfDay = new Date(dateStr + 'T00:00:00');
      const endOfDay = new Date(dateStr + 'T23:59:59');
      
      console.log(`   📅 Start of day: ${startOfDay.toISOString()}`);
      console.log(`   📅 End of day: ${endOfDay.toISOString()}`);
      
      whereClause.start_time = {
        [Op.between]: [startOfDay, endOfDay]
      };
    }

    const includeOptions = [];
    
    if (models.terrain) {
      includeOptions.push({
        model: models.terrain,
        as: 'terrain',
        attributes: ['id', 'name', 'type']
      });
    }

    console.log(`🔍 Query where clause:`, JSON.stringify(whereClause, null, 2));

    const results = await models.plage_horaire.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['start_time', 'ASC']]
    });

    console.log(`📋 Found ${results.length} slots matching the criteria`);

    return formatTimeResults(results);
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════════════════════
// Format timestamp to time-only string (HH:MM) for API response
// ════════════════════════════════════════════════════════════════════════════════
function formatTimeResults(results) {
  return results.map(plage => {
    const plageData = plage.toJSON();
    
    // Format start_time to HH:MM
    if (plageData.start_time) {
      const startTime = new Date(plageData.start_time);
      const startHours = startTime.getHours().toString().padStart(2, '0');
      const startMinutes = startTime.getMinutes().toString().padStart(2, '0');
      plageData.start_time = `${startHours}:${startMinutes}`;
    }
    
    // Format end_time to HH:MM
    if (plageData.end_time) {
      const endTime = new Date(plageData.end_time);
      const endHours = endTime.getHours().toString().padStart(2, '0');
      const endMinutes = endTime.getMinutes().toString().padStart(2, '0');
      plageData.end_time = `${endHours}:${endMinutes}`;
    }
    
    return plageData;
  });
}

export const updatePlageHoraire = async (id, data, models) => {
  try {
    const plage = await models.plage_horaire.findByPk(id);
    if (!plage) {
      throw new Error('PlageHoraire not found');
    }

    const newStartTime = data.start_time || plage.start_time;
    const newEndTime = data.end_time || plage.end_time;

    return await plage.update({
      start_time: newStartTime,
      end_time: newEndTime,
      price: data.price || plage.price,
      terrain_id: data.terrain_id || plage.terrain_id,
      disponible: data.disponible !== undefined ? data.disponible : plage.disponible
    });
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const updatePlageHoraireAvailability = async (id, disponible, models) => {
  try {
    const plage = await models.plage_horaire.findByPk(id);
    if (!plage) {
      throw new Error('PlageHoraire not found');
    }

    return await plage.update({ disponible });
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const deletePlageHoraire = async (id, models) => {
  try {
    const plage = await models.plage_horaire.findByPk(id);
    if (!plage) {
      throw new Error('PlageHoraire not found');
    }

    return await plage.destroy();
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const getAvailableSlotsByTimeRange = async (terrain_id, startTime, endTime, models) => {
  try {
    return await models.plage_horaire.findAll({
      where: {
        terrain_id,
        disponible: true,
        start_time: {
          [Op.gte]: startTime
        },
        end_time: {
          [Op.lte]: endTime
        }
      },
      order: [['start_time', 'ASC']]
    });
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const bulkUpdateAvailability = async (ids, disponible, models) => {
  try {
    return await models.plage_horaire.update(
      { disponible },
      {
        where: {
          id: {
            [Op.in]: ids
          }
        }
      }
    );
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};
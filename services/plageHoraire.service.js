import { Op } from 'sequelize';

export const createPlageHoraire = async (data, models) => {
  try {
    if (!models.plage_horaire) {
      throw new Error('PlageHoraire model not found in models object');
    }

    // Validate terrain exists if terrain_id is provided
    if (data.terrain_id && models.terrain) {
      const terrain = await models.terrain.findByPk(data.terrain_id);
      if (!terrain) {
        throw new Error('Terrain not found');
      }
    }

    // Validate time format and logic
    if (data.start_time && data.end_time) {
      if (data.start_time >= data.end_time) {
        throw new Error('Start time must be before end time');
      }
    }

    // Set default values if not provided
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
    
    // Apply filters
    if (filters.terrain_id) whereClause.terrain_id = filters.terrain_id;
    if (filters.type !== undefined) whereClause.type = filters.type;
    if (filters.disponible !== undefined) whereClause.disponible = filters.disponible;

    const includeOptions = [];
    
    // Include terrain data if terrain model exists and association is set
    if (models.terrain) {
      includeOptions.push({
        model: models.terrain,
        as: 'terrain',
        attributes: ['id', 'name', 'type'] // Adjust attributes based on your terrain model
      });
    }

    return await models.plage_horaire.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['start_time', 'ASC']]
    });
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const getPlageHoraireById = async (id, models) => {
  try {
    const includeOptions = [];
    
    // Include terrain data if terrain model exists and association is set
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

export const getPlageHorairesByTerrain = async (terrain_id, models, additionalFilters = {}) => {
  try {
    const whereClause = { terrain_id, ...additionalFilters };

    const includeOptions = [];
    
    // Include terrain data if terrain model exists and association is set
    if (models.terrain) {
      includeOptions.push({
        model: models.terrain,
        as: 'terrain',
        attributes: ['id', 'name', 'type']
      });
    }

    return await models.plage_horaire.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['start_time', 'ASC']]
    });
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};
export const updatePlageHoraire = async (id, data, models) => {
  try {
    const plage = await models.plage_horaire.findByPk(id);
    if (!plage) {
      throw new Error('PlageHoraire not found');
    }

    const newStartTime = data.start_time || plage.start_time;
    const newEndTime = data.end_time || plage.end_time;

    if (newStartTime >= newEndTime) {
      throw new Error('Start time must be before end time');
    }

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
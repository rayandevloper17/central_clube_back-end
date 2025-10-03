import express from 'express';
import {
  createPlageHoraire,
  getAllPlageHoraires,
  getPlageHoraireById,
  getPlageHorairesByTerrain,
  updatePlageHoraire,
  updateAvailability,
  deletePlageHoraire,
  getAvailableSlots
} from '../controllers/plageHoraire.controller.js';

const createPlageHoraireRoutes = (models) => {
  const router = express.Router();

  // Middleware to attach models to request
  router.use((req, res, next) => {
    req.models = models;
    next();
  });

  // Basic CRUD routes
  router.post('/', createPlageHoraire);
  router.get('/', getAllPlageHoraires);
  
  // Terrain-specific routes (must come before /:id routes to avoid conflicts)
  router.get('/terrain/:terrain_id', getPlageHorairesByTerrain);
  router.get('/terrain/:terrain_id/available', getAvailableSlots);
  
  // Bulk operations
  router.patch('/bulk/availability', async (req, res) => {
    try {
      const { ids, disponible } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'ids array is required'
        });
      }
      
      if (disponible === undefined) {
        return res.status(400).json({
          success: false,
          message: 'disponible field is required'
        });
      }

      const [affectedCount] = await req.models.plage_horaire.update(
        { disponible },
        {
          where: {
            id: ids
          }
        }
      );

      res.status(200).json({
        success: true,
        message: `Updated ${affectedCount} plage horaires`,
        affectedCount
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });

  // Search and filter routes
  router.get('/search', async (req, res) => {
    try {
      const { 
        terrain_id, 
        type, 
        disponible, 
        start_time_from, 
        start_time_to,
        price_min,
        price_max
      } = req.query;

      const whereClause = {};
      
      const { Op } = req.models.Sequelize;
      
      if (terrain_id) whereClause.terrain_id = terrain_id;
      if (type !== undefined) whereClause.type = parseInt(type);
      if (disponible !== undefined) whereClause.disponible = disponible === 'true';
      if (price_min) whereClause.price = { ...whereClause.price, [Op.gte]: parseFloat(price_min) };
      if (price_max) whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(price_max) };
      
      if (start_time_from || start_time_to) {
        whereClause.start_time = {};
        if (start_time_from) whereClause.start_time[Op.gte] = start_time_from;
        if (start_time_to) whereClause.start_time[Op.lte] = start_time_to;
      }

      const result = await req.models.plage_horaire.findAll({
        where: whereClause,
        include: req.models.terrain ? [{
          model: req.models.terrain,
          as: 'terrain',
          attributes: ['id', 'name']
        }] : [],
        order: [['start_time', 'ASC']]
      });

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
  });

  // Statistics route
  router.get('/stats/terrain/:terrain_id', async (req, res) => {
    try {
      const { terrain_id } = req.params;
      
      const total = await req.models.plage_horaire.count({
        where: { terrain_id }
      });
      
      const available = await req.models.plage_horaire.count({
        where: { terrain_id, disponible: true }
      });
      
      const occupied = total - available;
      
      const avgPrice = await req.models.plage_horaire.findOne({
        where: { terrain_id },
        attributes: [
          [req.models.sequelize.fn('AVG', req.models.sequelize.col('price')), 'avgPrice']
        ]
      });

      const typeDistribution = await req.models.plage_horaire.findAll({
        where: { terrain_id },
        attributes: [
          'type',
          [req.models.sequelize.fn('COUNT', req.models.sequelize.col('id')), 'count']
        ],
        group: ['type']
      });

      res.status(200).json({
        success: true,
        data: {
          total,
          available,
          occupied,
          occupancyRate: total > 0 ? ((occupied / total) * 100).toFixed(2) + '%' : '0%',
          averagePrice: avgPrice?.dataValues?.avgPrice || 0,
          typeDistribution
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });

  // Individual record routes (must come after specific routes)
  router.get('/:id', getPlageHoraireById);
  router.put('/:id', updatePlageHoraire);
  router.patch('/:id', updatePlageHoraire); // Support both PUT and PATCH
  router.patch('/:id/availability', updateAvailability);
  router.delete('/:id', deletePlageHoraire);

  // Validation middleware for time conflicts (optional)
  router.post('/validate-time-slot', async (req, res) => {
    try {
      const { terrain_id, start_time, end_time, exclude_id } = req.body;
      
      if (!terrain_id || !start_time || !end_time) {
        return res.status(400).json({
          success: false,
          message: 'terrain_id, start_time, and end_time are required'
        });
      }

      const { Op } = req.models.Sequelize;
      
      const whereClause = {
        terrain_id,
        [Op.or]: [
          {
            start_time: {
              [Op.between]: [start_time, end_time]
            }
          },
          {
            end_time: {
              [Op.between]: [start_time, end_time]
            }
          },
          {
            [Op.and]: [
              { start_time: { [Op.lte]: start_time } },
              { end_time: { [Op.gte]: end_time } }
            ]
          }
        ]
      };

      // Exclude current record if updating
      if (exclude_id) {
        whereClause.id = { [Op.ne]: exclude_id };
      }

      const conflicts = await req.models.plage_horaire.findAll({
        where: whereClause,
        attributes: ['id', 'start_time', 'end_time']
      });

      res.status(200).json({
        success: true,
        hasConflicts: conflicts.length > 0,
        conflicts: conflicts
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });

  return router;
};

export default createPlageHoraireRoutes;
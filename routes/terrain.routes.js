import express from 'express';
import createTerrainController from '../controllers/terrain.controller.js';
import createTerrainService from '../services/terrain.service.js';
import multer from 'multer';
import path from 'path';

export default (models) => {
  const router = express.Router();
  const terrainService = createTerrainService(models);
  const terrainController = createTerrainController(terrainService);

  router.post('/', terrainController.createTerrain);
  router.get('/', terrainController.getAllTerrains);
  router.get('/:id', terrainController.getTerrainById);
  router.put('/:id', terrainController.updateTerrain);
  router.delete('/:id', terrainController.deleteTerrain);

  // Configure multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // تأكد أن هذا المجلد موجود
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'terrain-' + uniqueSuffix + ext);
    }
  });

  const upload = multer({ storage: storage });

  // ✅ Upload image and save image_url in the terrain table
  router.post('/:id/upload-image', upload.single('image'), async (req, res) => {
    try {
      const terrainId = req.params.id;
      const terrain = await models.terrain.findByPk(terrainId); // ✅ USE models.terrain instead of req.models

      if (!terrain) {
        return res.status(404).json({ message: 'Terrain not found' });
      }

      const imagePath = `/uploads/${req.file.filename}`;
      await terrain.update({ image_url: imagePath });

      res.status(201).json({
        success: true,
        message: 'Image uploaded and terrain updated successfully',
        path: imagePath
      });
    } catch (err) {
      console.error('Upload Error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ✅ Get terrain image URL
  router.get('/:id/image', async (req, res) => {
    try {
      const terrain = await models.terrain.findByPk(req.params.id); // ✅ USE models.terrain instead of req.models

      if (!terrain) {
        return res.status(404).json({ success: false, message: 'Terrain not found' });
      }

      res.json({
        success: true,
        image_url: terrain.image_url
      });
    } catch (error) {
      console.error('Error fetching terrain image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch terrain image'
      });
    }
  });

  return router;
};

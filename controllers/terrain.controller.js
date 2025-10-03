export default (terrainService) => {
  return {
    createTerrain: async (req, res) => {
      try {
        const terrain = await terrainService.createTerrain(req.body);
        res.status(201).json(terrain);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },

    getAllTerrains: async (req, res) => {
      try {
        const terrains = await terrainService.getAllTerrains();
        res.json(terrains);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },

    getTerrainById: async (req, res) => {
      try {
        const terrain = await terrainService.getTerrainById(req.params.id);
        if (!terrain) {
          return res.status(404).json({ message: 'Terrain not found' });
        }
        res.json(terrain);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },

    updateTerrain: async (req, res) => {
      try {
        const updated = await terrainService.updateTerrain(req.params.id, req.body);
        res.json(updated);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },

    deleteTerrain: async (req, res) => {
      try {
        await terrainService.deleteTerrain(req.params.id);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }

    
  };
};

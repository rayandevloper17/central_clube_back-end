export default (models) => {
  const { Terrain } = models;

  return {
    createTerrain: async (data) => {
      return await Terrain.create(data);
    },

    getAllTerrains: async () => {
      return await Terrain.findAll();
    },

    getTerrainById: async (id) => {
      return await Terrain.findByPk(id);
    },

    updateTerrain: async (id, data) => {
      const terrain = await Terrain.findByPk(id);
      if (!terrain) throw new Error('Terrain not found');
      return await terrain.update(data);
    },

    deleteTerrain: async (id) => {
      const terrain = await Terrain.findByPk(id);
      if (!terrain) throw new Error('Terrain not found');
      return await terrain.destroy();
    }
  };
};

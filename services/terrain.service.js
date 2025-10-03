export default (models) => {
  const { terrain } = models;

  return {
    createTerrain: async (data) => {
      return await terrain.create(data);
    },

    getAllTerrains: async () => {
      return await terrain.findAll();
    },

    getTerrainById: async (id) => {
      return await terrain.findByPk(id);
    },

    updateTerrain: async (id, data) => {
      const terrain = await terrain.findByPk(id);
      if (!terrain) throw new Error('Terrain not found');
      return await terrain.update(data);
    },

    deleteTerrain: async (id) => {
      const terrain = await terrain.findByPk(id);
      if (!terrain) throw new Error('Terrain not found');
      return await terrain.destroy();
    }
  };
};

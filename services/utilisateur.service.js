// services/utilisateur.service.js
export default (models) => {
  const { Utilisateur } = models;

  return {
    findAll: () => Utilisateur.findAll(),
    findById: (id) => Utilisateur.findByPk(id),
    create: (data) => Utilisateur.create(data),
    update: (id, data) => Utilisateur.findByPk(id)
      .then(u => { if (!u) throw new Error('Utilisateur non trouvé'); return u.update(data); }),
    delete: (id) => Utilisateur.findByPk(id)
      .then(u => { if (!u) throw new Error('Utilisateur non trouvé'); return u.destroy(); }),
  };
};

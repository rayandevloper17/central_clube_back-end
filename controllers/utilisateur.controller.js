// controllers/utilisateur.controller.js
import bcrypt from 'bcrypt';

export default (models) => {
  const { Utilisateur } = models;

  return {
    // Retrieve all users
    getAll: async (req, res, next) => {
      try {
        const users = await Utilisateur.findAll();
        res.json(users);
      } catch (err) {
        next(err);
      }
    },

    // Get user by ID
    getById: async (req, res, next) => {
      try {
        const user = await Utilisateur.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.json(user);
      } catch (err) {
        next(err);
      }
    },

    // Create new user (hash password)
    create: async (req, res, next) => {
      try {
        const { mot_de_passe, email } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(mot_de_passe, salt);
        const user = await Utilisateur.create({ ...req.body, mot_de_passe: hash });
        res.status(201).json(user);
      } catch (err) {
        next(err);
      }
    },

    // Update existing user
    update: async (req, res, next) => {
      try {
        const user = await Utilisateur.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        if (req.body.mot_de_passe) {
          const salt = await bcrypt.genSalt(10);
          req.body.mot_de_passe = await bcrypt.hash(req.body.mot_de_passe, salt);
        }
        await user.update(req.body);
        res.json(user);
      } catch (err) {
        next(err);
      }
    },

    // Delete user
    delete: async (req, res, next) => {
      try {
        const user = await Utilisateur.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        await user.destroy();
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
};

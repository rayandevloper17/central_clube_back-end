// routes/admin.js
import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

export default (models) => {
  const router = express.Router();

  router.use(authenticateToken, requireAdmin);

  // Get all reservations with user details
  router.get('/reservations', async (req, res) => {
    const reservations = await models.reservation.findAll({
      include: [{ model: models.utilisateur, attributes: ['id', 'email', 'numero_telephone', 'nom', 'prenom'] }]
    });
    res.json(reservations);
  });

  // Get all users
  router.get('/users', async (req, res) => {
    const users = await models.utilisateur.findAll({ attributes: ['id', 'email', 'numero_telephone', 'nom', 'prenom', 'is_admin'] });
    res.json(users);
  });

  // Get all payments
  router.get('/payments', async (req, res) => {
    const payments = await models.credit_transaction.findAll();
    res.json(payments);
  });

  // Delete any reservation
  router.delete('/reservations/:id', async (req, res) => {
    const { id } = req.params;
    const deleted = await models.reservation.destroy({ where: { id } });
    if (deleted) return res.json({ success: true });
    res.status(404).json({ error: 'not_found' });
  });

  return router;
};

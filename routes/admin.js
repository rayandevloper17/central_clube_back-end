// routes/admin.js
import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/utilisateur.middleware.js';
import { Reservation, User, Payment } from '../models';

const router = express.Router();

router.use(authenticateToken, isAdmin);

// Get all reservations with user details
router.get('/reservations', async (req, res) => {
  const reservations = await Reservation.findAll({
    include: [{ model: User, attributes: ['id', 'email', 'numero_telephone', 'nom', 'prenom'] }]
  });
  res.json(reservations);
});

// Get all users
router.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'email', 'numero_telephone', 'nom', 'prenom', 'is_admin'] });
  res.json(users);
});

// Get all payments
router.get('/payments', async (req, res) => {
  const payments = await Payment.findAll();
  res.json(payments);
});

// Delete any reservation
router.delete('/reservations/:id', async (req, res) => {
  const { id } = req.params;
  const deleted = await Reservation.destroy({ where: { id } });
  if (deleted) return res.json({ success: true });
  res.status(404).json({ error: 'not_found' });
});

export default router;

// routes/reservations.js
import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import security from '../middleware/security.js';
import { Reservation, Terrain } from '../models';

const router = express.Router();

// Public: Get available slots (no user info)
router.get('/available-slots', async (req, res) => {
  const { terrain_id, date } = req.query;
  if (!terrain_id || !date) return res.status(400).json({ error: 'missing_params' });
  const reservations = await Reservation.findAll({
    where: { terrain_id, date },
    attributes: ['heure_debut', 'heure_fin']
  });
  res.json({
    terrain_id,
    date,
    occupied_slots: reservations.map(r => ({ heure_debut: r.heure_debut, heure_fin: r.heure_fin })),
    // available_slots: ... (implement slot calculation if needed)
  });
});

// Auth: Get current user's reservations only
router.get('/my-reservations', authenticateToken, async (req, res) => {
  const reservations = await Reservation.findAll({
    where: { user_id: req.user.id },
    include: [{ model: Terrain }]
  });
  res.json(reservations.map(security.sanitizeReservationForOwner));
});

// Auth: Create reservation (payment required, rate limited)
router.post('/create', authenticateToken, security.reservationLimiter, security.verifyPayment, async (req, res) => {
  const { terrain_id, date, heure_debut, heure_fin, payment_id } = req.body;
  // Check slot availability
  const conflict = await Reservation.findOne({
    where: { terrain_id, date, heure_debut, heure_fin }
  });
  if (conflict) return res.status(409).json({ error: 'slot_occupied' });
  // Create reservation
  const reservation = await Reservation.create({
    user_id: req.user.id,
    terrain_id,
    date,
    heure_debut,
    heure_fin,
    payment_id,
    status: 'confirmé',
    confirmation_code: Math.random().toString(36).substring(2, 10)
  });
  res.json(security.sanitizeReservationForOwner(reservation));
});

// Auth: Get reservation by ID (only owner)
router.get('/:id', authenticateToken, async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) return res.status(404).json({ error: 'not_found' });
  if (reservation.user_id !== req.user.id) return res.status(403).json({ error: 'forbidden' });
  res.json(security.sanitizeReservationForOwner(reservation));
});

// Remove any endpoint that allows querying by user_id or exposes other users' data

export default router;

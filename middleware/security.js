// middleware/security.js
const rateLimit = require('express-rate-limit');
const { Reservation, Payment, User } = require('../models');
const config = require('../config/config');

// Maintenance mode middleware
function maintenanceMode(req, res, next) {
  if (config.MAINTENANCE_MODE && !(req.user && req.user.is_admin)) {
    return res.status(503).json({
      error: 'maintenance',
      message: 'Application en maintenance. Réouverture le 5 décembre 2025.',
      status: 503
    });
  }
  next();
}

// Rate limiters
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Trop de tentatives d’inscription. Réessayez plus tard.'
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: 'Trop de tentatives de connexion. Réessayez plus tard.'
});
const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: req => req.user ? req.user.id : req.ip,
  message: 'Trop de réservations. Réessayez plus tard.'
});

// Payment verification middleware
async function verifyPayment(req, res, next) {
  const { payment_id } = req.body;
  if (!payment_id) {
    return res.status(402).json({ error: 'payment_required', message: 'Paiement requis.' });
  }
  const payment = await Payment.findOne({ where: { id: payment_id, user_id: req.user.id } });
  if (!payment) {
    return res.status(403).json({ error: 'invalid_payment', message: 'Paiement introuvable ou non autorisé.' });
  }
  if (payment.status !== 'completed') {
    return res.status(402).json({ error: 'payment_incomplete', message: 'Paiement non complété.' });
  }
  const used = await Reservation.findOne({ where: { payment_id: payment_id } });
  if (used) {
    return res.status(409).json({ error: 'payment_used', message: 'Paiement déjà utilisé.' });
  }
  req.payment = payment;
  next();
}

// Data sanitization
function sanitizeReservationForPublic(reservation) {
  return {
    terrain_id: reservation.terrain_id,
    date: reservation.date,
    heure_debut: reservation.heure_debut,
    heure_fin: reservation.heure_fin,
    status: 'occupé'
  };
}
function sanitizeReservationForOwner(reservation) {
  return {
    id: reservation.id,
    terrain_id: reservation.terrain_id,
    date: reservation.date,
    heure_debut: reservation.heure_debut,
    heure_fin: reservation.heure_fin,
    payment_id: reservation.payment_id,
    montant: reservation.montant,
    status: reservation.status,
    confirmation_code: reservation.confirmation_code,
    created_at: reservation.created_at
  };
}
function sanitizeUserProfile(user, isOwner) {
  if (!isOwner) {
    return { prenom: user.prenom };
  }
  return {
    id: user.id,
    email: user.email,
    numero_telephone: user.numero_telephone,
    nom: user.nom,
    prenom: user.prenom
  };
}

// IP blocking (basic suspicious activity)
const blockedIPs = new Set();
function ipBlocker(req, res, next) {
  if (blockedIPs.has(req.ip)) {
    return res.status(403).json({ error: 'blocked', message: 'IP bloquée pour activité suspecte.' });
  }
  next();
}

// Request logging with IP
function requestLogger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.originalUrl}`);
  next();
}

module.exports = {
  maintenanceMode,
  registerLimiter,
  loginLimiter,
  reservationLimiter,
  verifyPayment,
  sanitizeReservationForPublic,
  sanitizeReservationForOwner,
  sanitizeUserProfile,
  ipBlocker,
  requestLogger
};

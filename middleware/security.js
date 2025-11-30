// middleware/security.js
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { MAINTENANCE_MODE, ALLOWED_ORIGINS } from '../config/config.js';

// Maintenance mode middleware
function maintenanceMode(req, res, next) {
  if (MAINTENANCE_MODE && !(req.user && req.user.is_admin)) {
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
  message: 'Trop de tentatives d\'inscription. Réessayez plus tard.',
  keyGenerator: ipKeyGenerator // Use built-in IP key generator for IPv6 support
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: 'Trop de tentatives de connexion. Réessayez plus tard.',
  keyGenerator: ipKeyGenerator // Use built-in IP key generator for IPv6 support
});
const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: req => req.user ? req.user.id.toString() : ipKeyGenerator(req), // Use user ID or IP key generator
  message: 'Trop de réservations. Réessayez plus tard.'
});

// Payment verification middleware
async function verifyPayment(req, res, next) {
  // For now, skip payment verification since models are not available
  // This can be implemented later when needed
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

export {
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

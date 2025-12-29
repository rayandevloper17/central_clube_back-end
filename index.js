// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import initModels from './models/init-models.js';
import fs from 'fs';
import path from 'path';

// Import middlewares
import { authenticateToken } from './middlewares/auth.middleware.js';
import { sanitizeInput } from './middlewares/utilisateur.middleware.js';

// Import route factories
import createUtilisateurRoutes from './routes/utilisateur.routes.js';
import createCreditTransactionRoutes from './routes/creditTransaction.routes.js';
import createDisponibiliteTerrainRoutes from './routes/disponibiliteTerrain.routes.js';
import createPlageHoraireRoutes from './routes/plageHoraire.routes.js';
import createTerrainRoutes from './routes/terrain.routes.js';
import createNoteUtilisateurRoutes from './routes/noteUtilisateurRoutes.js';
import createParticipantRoutes from './routes/participant.routes.js';
import ReservationService from './services/reservation.service.js';
import ReservationController from './controllers/reservation.controller.js';
import ReservationRoutes from './routes/reservation.routes.js';
import matchRoutes from './routes/matchRoutes.js';
import reservationUtilisateurRoutes from './routes/reservationUtilisateur.routes.js';
import createVerificationEmailRoutes from './routes/emailVerification.route.js';
import { addNotification, getNotificationsForUser, markNotificationRead } from './utils/notificationBus.js';

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

// Initialize models
const models = initModels(sequelize);

// ✅ ADD ASSOCIATIONS HERE - After models are initialized
console.log('🔗 Setting up model associations...');

// PlageHoraire belongs to Terrain
if (models.plage_horaire && models.terrain) {
  models.plage_horaire.belongsTo(models.terrain, {
    foreignKey: 'terrain_id',
    as: 'terrain'
  });
  
  // Terrain has many PlageHoraires
  models.terrain.hasMany(models.plage_horaire, {
    foreignKey: 'terrain_id',
    as: 'plageHoraires'
  });
  
  console.log('✅ PlageHoraire <-> Terrain association created');
} else {
  console.log('⚠️ Could not create PlageHoraire <-> Terrain association');
  console.log('Available models:', Object.keys(models));
}

// Add other associations as needed
// Example: If you have reservations related to plage_horaire
if (models.reservation && models.plage_horaire) {
  models.reservation.belongsTo(models.plage_horaire, {
    foreignKey: 'id_plage_horaire',
    as: 'plage_horaire'
  });
  
  models.plage_horaire.hasMany(models.reservation, {
    foreignKey: 'id_plage_horaire',
    as: 'reservations'
  });
  
 

  models.participant.belongsTo(models.reservation, {
    foreignKey: 'id_reservation',  // must match column in participant table
    as: 'reservation'
  });
  

  // Add association between reservation and note_utilisateur
if (models.reservation && models.note_utilisateur) {
  models.reservation.hasMany(models.note_utilisateur, {
    foreignKey: 'id_reservation',
    as: 'notes'
  });

  models.note_utilisateur.belongsTo(models.reservation, {
    foreignKey: 'id_reservation',
    as: 'reservation'
  });

  console.log('✅ Reservation <-> NoteUtilisateur association created');
} else {
  console.log('⚠️ Could not create Reservation <-> NoteUtilisateur association');
}

// Add association between note_utilisateur and utilisateur for id_noteur
if (models.note_utilisateur && models.utilisateur) {
  models.note_utilisateur.belongsTo(models.utilisateur, {
    foreignKey: 'id_noteur',
    as: 'noteur'
  });

  models.utilisateur.hasMany(models.note_utilisateur, {
    foreignKey: 'id_noteur',
    as: 'notesGiven'
  });

  console.log('✅ NoteUtilisateur <-> Utilisateur (noter) association created');
} else {
  console.log('⚠️ Could not create NoteUtilisateur <-> Utilisateur (noter) association');
}




  models.reservation.hasMany(models.participant, {
    foreignKey: 'id_reservation',
    as: 'participants'
  });

  // Add associations for utilisateur, terrain and plage_horaire
  models.reservation.belongsTo(models.utilisateur, {
    foreignKey: 'id_utilisateur',
    as: 'utilisateur'
  });

  models.reservation.belongsTo(models.terrain, {
    foreignKey: 'id_terrain', 
    as: 'terrain'
  });

  models.participant.belongsTo(models.utilisateur, {
    foreignKey: 'id_utilisateur',
    as: 'utilisateur'
  });
  
  console.log('✅ Reservation <-> PlageHoraire association created');
}

// Add Sequelize instance to models for use in routes (for Op operators)
models.Sequelize = Sequelize;
models.sequelize = sequelize;

const reservationService = ReservationService(models);
const reservationController = ReservationController(reservationService);

// Create Express app
const app = express();
// Respect reverse proxy headers (X-Forwarded-Proto/Host) for correct https detection
// This is important when the app is behind Nginx or another proxy
app.set('trust proxy', 1);

// ✅ IMPROVED CORS CONFIGURATION (env-driven allowed origins)
// Use comma-separated ALLOWED_ORIGINS for production domains; include FRONTEND_URL for convenience.
const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...envAllowedOrigins,
  process.env.FRONTEND_URL,
  // Local development defaults
  'http://24433e926f95.ngrok-free.app:3000',
  'https://24433e926f95.ngrok-free.app',
  'http://24433e926f95.ngrok-free.app:8080',
  'http://24433e926f95.ngrok-free.app:4200',
  'http://24433e926f95.ngrok-free.app:5173',
  'http://24433e926f95.ngrok-free.app:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (no origin)
    if (!origin) return callback(null, true);

    // Normalize origin (strip trailing slash)
    const normalized = origin.replace(/\/$/, '');

    // Allow any 24433e926f95.ngrok-free.app/24433e926f95.ngrok-free.app origin regardless of port (http or https)
    if (
      normalized.startsWith('http://24433e926f95.ngrok-free.app') ||
      normalized.startsWith('https://24433e926f95.ngrok-free.app') ||
      normalized.startsWith('http://24433e926f95.ngrok-free.app') ||
      normalized.startsWith('https://24433e926f95.ngrok-free.app')
    ) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(normalized)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 24 * 60 * 60, // cache preflight for 1 day
  optionsSuccessStatus: 204, // explicitly return 204 for successful preflight
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ GLOBAL MIDDLEWARE
// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 100),
    hasAuth: !!req.headers.authorization
  });
  next();
});

// Global input sanitization
app.use(sanitizeInput);

// Health check endpoint (no authentication needed)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint to verify routes are working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    availableRoutes: {
      public: [
        'POST /api/utilisateurs/register',
        'POST /api/utilisateurs/login',
        'POST /api/utilisateurs/refresh-token',
        'POST /api/utilisateurs/logout',
        'GET /health',
        'GET /api/test'
      ]
    }
  });
});

// ✅ REGISTER ROUTES WITH APPROPRIATE MIDDLEWARE

// 🔓 PUBLIC ROUTES (no authentication required)
app.use('/api/utilisateurs', createUtilisateurRoutes(models)); // login/register handled inside

app.use('/api/terrains', createTerrainRoutes(models)); // public terrain info
app.use('/api/email', createVerificationEmailRoutes(models)); // email verification

// 🔒 PROTECTED ROUTES (authentication required)
app.use('/api/credit-transactions', authenticateToken, createCreditTransactionRoutes(models));
app.use('/api/disponibilites', authenticateToken, createDisponibiliteTerrainRoutes(models));
app.use('/api/plage-horaire', authenticateToken, createPlageHoraireRoutes(models));
app.use('/api/notes', authenticateToken, createNoteUtilisateurRoutes(models));
app.use('/api/participants', authenticateToken, createParticipantRoutes(models));
app.use('/api/reservations', authenticateToken, ReservationRoutes(reservationController, null)); // notificationController is optional
app.use('/api/matches', authenticateToken, matchRoutes(models));
app.use('/reservation-utilisateur', authenticateToken, reservationUtilisateurRoutes(models));

// 🔔 Minimal Notifications API (in-memory)
app.post('/api/notifications', authenticateToken, (req, res) => {
  try {
    const { recipient_id, reservation_id, submitter_id, type, message } = req.body || {};
    if (!recipient_id) return res.status(400).json({ error: 'recipient_id is required' });
    const notif = addNotification({ recipient_id, reservation_id, submitter_id, type, message });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications/user/:userId', authenticateToken, (req, res) => {
  try {
    const userId = req.params.userId;
    const notifs = getNotificationsForUser(userId);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const updated = markNotificationRead(id);
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Static file serving (public)
// Ensure uploads directory exists and serve it statically
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ✅ 404 HANDLER - FIXED FOR EXPRESS 5.x
app.use('/*catchall', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    message: `La route ${req.method} ${req.originalUrl} n'existe pas`,
    availableRoutes: [
      'GET /health',
      'POST /api/utilisateurs/register',
      'POST /api/utilisateurs/login',
      'GET /api/terrains',
      // Add more public routes as needed
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Erreur de validation',
      message: err.message,
      details: err.errors
    });
  }


  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ 
      error: 'Conflit de données',
      message: 'Cette ressource existe déjà',
      field: err.errors?.[0]?.path
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ 
      error: 'Référence invalide',
      message: 'Référence vers une ressource inexistante'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Token invalide',
      message: 'Votre session a expiré, veuillez vous reconnecter'
    });
  }

  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({ 
    error: statusCode === 500 ? 'Erreur serveur interne' : err.message,
    message: statusCode === 500 ? 'Une erreur inattendue s\'est produite' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 3001;

(async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    console.log('📋 Available models:', Object.keys(models));
    
    // Skip table sync to avoid permission issues
    // Only sync if explicitly needed and user has permissions
    if (process.env.ENABLE_DB_SYNC === 'true' && process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false }); // Don't auto-alter tables
      console.log('✅ Database models synced');
    } else {
      console.log('⏭️ Database sync skipped (use ENABLE_DB_SYNC=true to enable)');
    }
     
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📚 API Documentation: http://0.0.0.0:${PORT}/health`);
      console.log(`🔒 Authentication required for protected routes`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

      // Start refund scheduler: checks reservation status changes and slot conflicts
      const intervalMs = Number(process.env.REFUND_SCHEDULER_INTERVAL_MS || 60_000);
      setInterval(async () => {
        try {
          await reservationService.processStatusRefunds();
        } catch (err) {
          console.error('[Scheduler] Refund processing error:', err?.message);
        }
      }, intervalMs);
      console.log(`⏱️ Refund scheduler started (interval=${intervalMs}ms)`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
})();
// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import initModels from './models/init-models.js';

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
    foreignKey: 'id',
    as: 'plageHoraire'
  });
  
  models.plage_horaire.hasMany(models.reservation, {
    foreignKey: 'id',
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

// ✅ IMPROVED CORS CONFIGURATION
const corsOptions = {
  origin: [
    'http://localhost:300',
    'http://localhost:3001', 
    'http://localhost:8080',
    'http://localhost:4200',
    // Add your frontend URLs here
    process.env.FRONTEND_URL // Add this to your .env file
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept'
  ],
  credentials: true
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
app.use('/api/reservations', authenticateToken, ReservationRoutes(reservationController));
app.use('/api/matches', authenticateToken, matchRoutes(models));
app.use('/reservation-utilisateur', authenticateToken, reservationUtilisateurRoutes(models));

// Static file serving (public)
app.use('/uploads', express.static('uploads'));

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
const PORT = process.env.PORT || 300;

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
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/health`);
      console.log(`🔒 Authentication required for protected routes`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
})();
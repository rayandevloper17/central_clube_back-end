// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import initModels from './models/init-models.js';
import createCreditTransactionRoutes from './routes/creditTransaction.routes.js';
import createDisponibiliteTerrainRoutes from './routes/disponibiliteTerrain.routes.js';

// Import route factories
import createUtilisateurRoutes from './routes/utilisateur.routes.js';
// import createClubRoutes from './routes/club.routes.js';
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
// 


const reservationService = ReservationService(models);
const reservationController = ReservationController(reservationService);
// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Register routes (pass models, get router)
app.use('/api/utilisateurs', createUtilisateurRoutes(models));
app.use('/api/credit-transactions', createCreditTransactionRoutes(models));
app.use('/api/disponibilites', createDisponibiliteTerrainRoutes(models));
app.use('/api/plage-horaire', createPlageHoraireRoutes(models));
app.use('/api/terrains', createTerrainRoutes(models));
app.use('/api/notes', createNoteUtilisateurRoutes(models));
app.use('/api/participants', createParticipantRoutes(models));
app.use('/api/reservations', ReservationRoutes(reservationController));

app.use('/reservation-utilisateur', reservationUtilisateurRoutes(models));
app.use('/api/email', createVerificationEmailRoutes(models));
app.use('/api/matches', matchRoutes(models));


// 
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    console.log('📋 Available models:', Object.keys(models));

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
})();

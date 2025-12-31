// Minimal server entry to mirror index.js route mounting for production
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import initModels from './models/init-models.js';

// Route factories
import createUtilisateurRoutes from './routes/utilisateur.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Sequelize and models
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
const models = initModels(sequelize);

// Health and test endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API routes are working!',
    availableRoutes: {
      public: [
        'POST /api/utilisateurs/register',
        'POST /api/utilisateurs/login',
        'POST /api/utilisateurs/refresh-token',
        'POST /api/utilisateurs/logout',
      ],
      protected: [
        'POST /api/utilisateurs/profile/me/profile-picture',
      ],
    },
  });
});

// Serve uploads statically at /uploads
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Mount utilisateurs routes
app.use('/api/utilisateurs', createUtilisateurRoutes(models));

// 404 catch-all
app.use('/*catchall', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.method} ${req.originalUrl} n'existe pas`,
    availableRoutes: [
      'GET /health',
      'POST /api/utilisateurs/register',
      'POST /api/utilisateurs/login',
      'POST /api/utilisateurs/refresh-token',
      'POST /api/utilisateurs/logout',
      'POST /api/utilisateurs/profile/me/profile-picture',
      'GET /uploads/<filename>',
    ],
  });
});

// Start server when run directly
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

export default app;
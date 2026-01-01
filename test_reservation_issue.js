import { Sequelize } from 'sequelize';
import initModels from './models/init-models.js';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false
  }
);

const models = initModels(sequelize);
const { Reservation, PlageHoraire, Terrain, Utilisateur } = models;

async function analyzeReservationConflict() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Check current state of plage_horaire and reservations
    console.log('\n=== CURRENT STATE ANALYSIS ===');
    
    // Get some sample plage_horaire records
    const plages = await models.plage_horaire.findAll({
      limit: 5,
      include: [{
        model: models.reservation,
        where: { isCancel: 0 },
        required: false
      }]
    });

    console.log('PlageHoraire with reservations:');
    plages.forEach(plage => {
      console.log(`Plage ${plage.id}: disponible=${plage.disponible}, reservations=${plage.reservations?.length || 0}`);
    });

    // Check for reservations with typer=1 (open match)
    const openMatches = await models.reservation.findAll({
      where: { 
        typer: 1, // Open match
        isCancel: 0 
      },
      include: [models.plage_horaire]
    });

    console.log('\n=== OPEN MATCHES (typer=1) ===');
    openMatches.forEach(match => {
      console.log(`Reservation ${match.id}: plage=${match.id_plage_horaire}, date=${match.date}, etat=${match.etat}`);
      console.log(`  Plage details: disponible=${match.plage_horaire?.disponible}`);
    });

    // Check for reservations with typer=2 (private match)
    const privateMatches = await models.reservation.findAll({
      where: { 
        typer: 2, // Private match
        isCancel: 0 
      },
      include: [models.plage_horaire]
    });

    console.log('\n=== PRIVATE MATCHES (typer=2) ===');
    privateMatches.forEach(match => {
      console.log(`Reservation ${match.id}: plage=${match.id_plage_horaire}, date=${match.date}, etat=${match.etat}`);
      console.log(`  Plage details: disponible=${match.plage_horaire?.disponible}`);
    });

    // Check the specific constraint
    console.log('\n=== CHECKING CONSTRAINTS ===');
    try {
      // This would trigger the conflict if we try to create duplicate
      await sequelize.query(`
        SELECT * FROM reservation 
        WHERE id_plage_horaire = 1 AND date = '2024-01-15' AND "isCancel" = 0
      `);
    } catch (error) {
      console.log('Constraint check error:', error.message);
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

analyzeReservationConflict();
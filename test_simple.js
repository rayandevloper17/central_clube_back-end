import { Sequelize } from 'sequelize';
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

async function checkReservationConflict() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Check the specific constraint that causes the conflict
    console.log('\n=== CHECKING RESERVATION CONSTRAINTS ===');
    
    const constraints = await sequelize.query(`
      SELECT conname, contype, conindid::regclass, conrelid::regclass
      FROM pg_constraint 
      WHERE conrelid = 'reservation'::regclass 
      AND conname LIKE '%plage%'
      ORDER BY conname;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Reservation constraints related to plage_horaire:');
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.conname} (${constraint.contype})`);
    });

    // Check for existing active reservations
    console.log('\n=== CHECKING EXISTING ACTIVE RESERVATIONS ===');
    
    const existingReservations = await sequelize.query(`
      SELECT r.id, r.id_plage_horaire, r.date, r.typer, r.isCancel, r.etat,
             ph.disponible, ph.start_time, ph.end_time
      FROM reservation r
      JOIN plage_horaire ph ON r.id_plage_horaire = ph.id
      WHERE r.isCancel = 0
      ORDER BY r.id_plage_horaire, r.date
      LIMIT 10;
    `, { type: sequelize.QueryTypes.SELECT });

    if (existingReservations.length === 0) {
      console.log('No active reservations found.');
    } else {
      console.log('Active reservations:');
      existingReservations.forEach(res => {
        console.log(`  - Reservation ${res.id}: Plage ${res.id_plage_horaire}, Date ${res.date}, Type ${res.typer}, Etat ${res.etat}`);
        console.log(`    Plage disponible: ${res.disponible}, Time: ${res.start_time}-${res.end_time}`);
      });
    }

    // Check the specific error message we're looking for
    console.log('\n=== CHECKING FOR OPEN MATCH CONFLICTS ===');
    
    const openMatches = await sequelize.query(`
      SELECT r.id, r.id_plage_horaire, r.date, r.typer, r.etat,
             ph.disponible, ph.start_time, ph.end_time
      FROM reservation r
      JOIN plage_horaire ph ON r.id_plage_horaire = ph.id
      WHERE r.isCancel = 0 AND r.typer = 2
      ORDER BY r.id_plage_horaire, r.date;
    `, { type: sequelize.QueryTypes.SELECT });

    if (openMatches.length === 0) {
      console.log('No open matches (typer=2) found.');
    } else {
      console.log('Open matches that would block private reservations:');
      openMatches.forEach(match => {
        console.log(`  - Open Match ${match.id}: Plage ${match.id_plage_horaire}, Date ${match.date}`);
        console.log(`    This would cause: "Ce créneau est déjà occupé par un match ouvert."`);
      });
    }

    console.log('\n=== ANALYSIS SUMMARY ===');
    console.log('The conflict error "Ce créneau est déjà occupé par un match ouvert." occurs when:');
    console.log('1. An open match (typer=2) exists for the same plage_horaire and date');
    console.log('2. A user tries to create a private reservation (typer=1) for the same slot');
    console.log('3. The system prevents this to avoid conflicts');
    console.log('');
    console.log('This is working as intended - users should join open matches instead of creating private ones.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkReservationConflict();
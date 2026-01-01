import { sequelize, Reservation, PlageHoraire } from './index.js';

async function testTables() {
  try {
    console.log('Testing table accessibility...');
    
    // Test connection first
    await sequelize.authenticate();
    console.log('✓ Database connection successful');
    
    // Test Reservation table
    console.log('Testing Reservation table...');
    const reservationCount = await Reservation.count();
    console.log(`✓ Reservation table accessible - ${reservationCount} records`);
    
    // Test PlageHoraire table
    console.log('Testing PlageHoraire table...');
    const plageCount = await PlageHoraire.count();
    console.log(`✓ PlageHoraire table accessible - ${plageCount} records`);
    
    console.log('\n🎉 All tables are accessible!');
    
  } catch (error) {
    console.error('❌ Error accessing tables:', error.message);
  } finally {
    await sequelize.close();
  }
}

testTables();
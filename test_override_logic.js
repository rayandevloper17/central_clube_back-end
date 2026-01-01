import { Sequelize, Op } from 'sequelize';
import dotenv from 'dotenv';
import initModels from './models/init-models.js';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false
});

const models = initModels(sequelize);

async function testOverrideLogic() {
  const t = await sequelize.transaction();
  
  try {
    console.log('🧪 Testing override logic...');
    
    // Create test data
    const testUser = await models.utilisateur.create({
      nom: 'Test User',
      email: 'test@example.com',
      telephone: '1234567890',
      credit_balance: 100
    }, { transaction: t });
    
    const testPlage = await models.plage_horaire.create({
      heure_debut: '08:30:00',
      heure_fin: '10:00:00',
      disponible: true,
      prix: 50
    }, { transaction: t });
    
    const testDate = '2024-01-15';
    
    // Create an open match reservation with etat != 1 (invalid)
    const openMatchReservation = await models.reservation.create({
      id_utilisateur: testUser.id,
      id_plage_horaire: testPlage.id,
      date: testDate,
      typer: 2, // Open match
      etat: 0, // Not valid yet
      prix_total: 50,
      isCancel: 0
    }, { transaction: t });
    
    console.log('✅ Created test open match reservation with etat=0');
    
    // Add a participant to the open match
    const participant = await models.participant.create({
      id_reservation: openMatchReservation.id,
      id_utilisateur: testUser.id,
      prix: 50
    }, { transaction: t });
    
    console.log('✅ Added participant to open match');
    
    // Now test the override logic by creating a private reservation
    const privateReservation = await models.reservation.create({
      id_utilisateur: testUser.id,
      id_plage_horaire: testPlage.id,
      date: testDate,
      typer: 1, // Private
      etat: 1, // Valid
      prix_total: 50,
      isCancel: 0
    }, { transaction: t });
    
    console.log('✅ Created private reservation (should trigger override)');
    
    // Simulate the override logic
    const openMatchReservations = await models.reservation.findAll({
      where: {
        id_plage_horaire: testPlage.id,
        date: testDate,
        typer: 2,
        isCancel: 0,
        etat: { [Op.ne]: 1 }
      },
      transaction: t
    });
    
    console.log(`Found ${openMatchReservations.length} open match reservations to cancel`);
    
    for (const reservation of openMatchReservations) {
      // Cancel the reservation
      await reservation.update({
        isCancel: 1,
        etat: -1,
        date_modif: new Date()
      }, { transaction: t });
      
      console.log(`Cancelled reservation ${reservation.id}`);
      
      // Find participants
      const participants = await models.participant.findAll({
        where: { id_reservation: reservation.id },
        transaction: t
      });
      
      console.log(`Found ${participants.length} participants`);
      
      // Remove participants
      await models.participant.destroy({
        where: { id_reservation: reservation.id },
        transaction: t
      });
      
      console.log(`Removed ${participants.length} participants`);
    }
    
    // Verify final state
    const finalOpenMatches = await models.reservation.findAll({
      where: {
        id_plage_horaire: testPlage.id,
        date: testDate,
        typer: 2,
        isCancel: 0
      },
      transaction: t
    });
    
    const finalParticipants = await models.participant.findAll({
      where: { id_reservation: openMatchReservation.id },
      transaction: t
    });
    
    console.log('📊 Final state:');
    console.log(`- Active open matches: ${finalOpenMatches.length}`);
    console.log(`- Participants remaining: ${finalParticipants.length}`);
    console.log(`- Private reservation created: ${privateReservation.id}`);
    
    await t.rollback(); // Rollback test data
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    await t.rollback();
    console.error('❌ Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testOverrideLogic();
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import initModels from './models/init-models.js';

dotenv.config();

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

const models = initModels(sequelize);

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful!');
    
    // Check if users exist
    const users = await models.utilisateur.findAll({
      attributes: ['id', 'email', 'nom', 'prenom'],
      limit: 10
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.nom} ${user.prenom}`);
    });
    
    // Check if testuser@example.com exists
    const testUser = await models.utilisateur.findOne({
      where: { email: 'testuser@example.com' }
    });
    
    if (testUser) {
      console.log('\nTest user found:');
      console.log(`ID: ${testUser.id}, Email: ${testUser.email}`);
    } else {
      console.log('\nTest user not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
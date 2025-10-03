import { Sequelize, DataTypes } from 'sequelize';
import initModels from './models/init-models.js'; // adjust the path to your init

// ✅ Create a dummy DB connection (you don't need a real DB)
const sequelize = new Sequelize('postgres://fake:fake@localhost:5432/fake', {
  dialect: 'postgres',
  logging: console.log, // 🔥 Logs SQL instead of executing
});

// ✅ Initialize models
initModels(sequelize);

// ✅ Generate SQL without executing (simulate the sync)
try {
  await sequelize.getQueryInterface().dropAllTables(); // optional, shows DROP TABLE IF EXISTS
  await sequelize.sync({ force: true }); // 🔥 Logs CREATE TABLE statements
  console.log('✅ SQL generation complete!');
} catch (err) {
  console.error('❌ Error generating SQL:', err);
}

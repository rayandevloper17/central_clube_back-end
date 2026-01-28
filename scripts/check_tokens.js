import models from '../models/init-models.js'; // Adjust path as needed
import { Sequelize } from 'sequelize';
import 'dotenv/config';

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

const { utilisateur } = models(sequelize);

async function checkTokens() {
    try {
        const users = await utilisateur.findAll({
            where: {
                fcm_token: { [Sequelize.Op.ne]: null }
            },
            attributes: ['id', 'email', 'fcm_token']
        });

        console.log(`Found ${users.length} users with tokens.`);
        users.forEach(u => {
            console.log(`User ${u.id} (${u.email}): ${u.fcm_token.substring(0, 20)}...`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkTokens();

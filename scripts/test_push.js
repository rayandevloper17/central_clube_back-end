import notificationService from '../services/notification.service.js';
import models from '../models/init-models.js';
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

async function sendTest() {
    try {
        console.log('🔍 Fetching user 521...');
        const user = await utilisateur.findByPk(521);

        if (!user) {
            console.log('❌ User 521 not found!');
            return;
        }

        if (!user.fcm_token) {
            console.log('❌ User 521 has no FCM token saved.');
            return;
        }

        console.log('📱 Found token:', user.fcm_token.substring(0, 20) + '...');

        console.log('🚀 Sending Test Notification...');
        const result = await notificationService.sendMulticast(
            [user.fcm_token],
            'Test Notification 🔔',
            'Congratulations! Push notifications are working perfectly.',
            { type: 'test_id', click_action: 'FLUTTER_NOTIFICATION_CLICK' }
        );

        console.log('✅ Result:', JSON.stringify(result, null, 2));

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await sequelize.close();
        setTimeout(() => process.exit(0), 1000); // Give time for logs
    }
}

sendTest();

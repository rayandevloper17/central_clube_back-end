import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import service account key
// Note: In production, path should be absolute or handled via environment variables
// Invoke require directly since we already created it
const serviceAccount = require('../config/padel-mindset-firebase-adminsdk-fbsvc-2824351474.json');

// Initialize Firebase Admin
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('🔥 Firebase Admin Initialized Successfully');
} catch (error) {
    if (!admin.apps.length) {
        console.error('❌ Firebase Admin Initialization Error:', error);
    }
}

const notificationService = {
    /**
     * Send a multicast message to multiple devices/users
     * @param {Array<string>} tokens - FCM device tokens
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {Object} data - Optional data payload
     */
    sendMulticast: async (tokens, title, body, data = {}) => {
        if (!tokens || tokens.length === 0) return;

        // Filter out invalid tokens
        const validTokens = tokens.filter(t => t && t.length > 10);
        if (validTokens.length === 0) return;

        const message = {
            notification: {
                title: title,
                body: body,
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            tokens: validTokens,
        };

        try {
            const response = await admin.messaging().sendEachForMulticast(message);
            console.log(`📨 Sent ${response.successCount} notifications, ${response.failureCount} failed.`);

            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        console.error(`Status [${idx}] Error:`, resp.error);
                    }
                });
            }
            return response;
        } catch (error) {
            console.error('Error sending multicast notification:', error);
        }
    },

    /**
     * Send to a specific user (convenience wrapper finding tokens from DB model would happen in controller/service logic)
     * This function assumes you pass the tokens directly.
     */
    sendToTokens: async (tokens, title, body, data) => {
        return await notificationService.sendMulticast(tokens, title, body, data);
    }
};

export default notificationService;

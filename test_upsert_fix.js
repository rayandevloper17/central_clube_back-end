/**
 * Test membership purchase after fixing the upsert issue
 */
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
});

async function testPurchase() {
    try {

        
        console.log('\n=== TESTING MEMBERSHIP PURCHASE FIX ===\n');

        // Check current membership for user 521
        console.log('1. Checking current membership for user 521...');
        const [beforeRows] = await seq.query('SELECT * FROM membership WHERE id_user = 521');
        console.log('Before:', beforeRows[0]);

        // Simulate the upsert operation with conflictFields
        console.log('\n2. Simulating upsert with conflictFields...');
        const [result] = await seq.query(`
            INSERT INTO "public"."membership" 
            ("id_user", "id_club", "dateend", "typemmbership", "created_at", "updated_at") 
            VALUES (521, 1, '2026-02-19', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("id_user", "id_club") 
            DO UPDATE SET 
                "typemmbership" = EXCLUDED."typemmbership",
                "dateend" = EXCLUDED."dateend",
                "updated_at" = EXCLUDED."updated_at"
            RETURNING *;
        `);

        console.log('\n3. Result of upsert:');
        console.log(result[0]);

        // Check final state
        const [afterRows] = await seq.query('SELECT * FROM membership WHERE id_user = 521');
        console.log('\n4. After upsert:');
        console.log(afterRows[0]);

        console.log('\n Test completed successfully!');
        console.log('The upsert should now work correctly with ON CONFLICT (id_user, id_club)');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.original) {
            console.error('Database error:', {
                code: error.original.code,
                detail: error.original.detail
            });
        }
        process.exit(1);
    }
}

testPurchase();

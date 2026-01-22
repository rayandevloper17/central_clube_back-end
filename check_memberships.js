/**
 * Quick Database Check - See all memberships
 */
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
});

async function checkDatabase() {
    try {
        console.log('\n=== CHECKING MEMBERSHIP TABLE ===\n');

        const [rows] = await seq.query('SELECT * FROM membership ORDER BY id');

        if (rows.length === 0) {
            console.log('❌ NO MEMBERSHIPS FOUND IN DATABASE!');
            console.log('\nThe membership table exists but is EMPTY.');
            console.log('Run: node setup_db.js to add test data\n');
        } else {
            console.log(`✅ Found ${rows.length} memberships:\n`);
            console.table(rows);

            // Check for user 521 specifically
            const user521 = rows.find(r => r.id_user == 521);
            if (user521) {
                console.log('\n✅ User 521 membership found:');
                console.log(JSON.stringify(user521, null, 2));
            } else {
                console.log('\n❌ User 521 NOT found in memberships!');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkDatabase();

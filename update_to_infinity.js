/**
 * Update user 521 to Infinity membership
 */
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: true
});

async function updateToInfinity() {
    try {
        console.log('\n=== UPDATING USER 521 TO INFINITY ===\n');

        // Update membership to Infinity (type 4)
        await seq.query(`
      UPDATE membership
      SET typemmbership = 4,
          dateend = '2030-12-31 23:59:59',
          updated_at = NOW()
      WHERE id_user = 521 AND id_club = 1
    `);

        console.log('✅ Updated user 521 to Infinity membership!');

        // Verify
        const [result] = await seq.query('SELECT * FROM membership WHERE id_user = 521');
        console.log('\nVerified membership:');
        console.table(result);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

updateToInfinity();

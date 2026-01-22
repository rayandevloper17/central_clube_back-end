/**
 * Add membership for user 521
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

async function addMembership() {
    try {
        console.log('\n=== ADDING MEMBERSHIP FOR USER 521 ===\n');

        // Check if user 521 exists
        const [users] = await seq.query('SELECT id, nom, prenom, email FROM utilisateur WHERE id = 521');

        if (users.length === 0) {
            console.log('❌ User 521 does not exist in database!');
            console.log('\nAvailable users:');
            const [allUsers] = await seq.query('SELECT id, nom, prenom, email FROM utilisateur LIMIT 10');
            console.table(allUsers);
            process.exit(1);
        }

        console.log('✅ User found:', users[0]);

        // Add membership for user 521
        await seq.query(`
      INSERT INTO membership (id, id_user, id_club, dateend, typemmbership, created_at, updated_at)
      VALUES (DEFAULT, 521, 1, '2026-12-31 23:59:59', 2, NOW(), NOW())
      ON CONFLICT (id_user, id_club) 
      DO UPDATE SET
        dateend = EXCLUDED.dateend,
        typemmbership = EXCLUDED.typemmbership,
        updated_at = NOW()
    `);

        console.log('\n✅ Membership added successfully!');
        console.log('Type: Gold (2)');
        console.log('Expires: 2026-12-31');

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

addMembership();

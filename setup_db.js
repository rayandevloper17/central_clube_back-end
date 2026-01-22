/**
 * Database Setup Script - Creates membership table and inserts test data
 * Run with: node setup_db.js
 */

import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Sequelize connection
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: console.log
    }
);

async function setupDatabase() {
    console.log('\n========================================');
    console.log('Central Club - Database Setup');
    console.log('========================================\n');

    try {
        // Test connection
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('✓ Connected to database successfully\n');

        // Read SQL files
        const createTableSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'create_membership_table.sql'),
            'utf8'
        );

        // Execute create table SQL
        console.log('[1/3] Creating membership table...');
        await sequelize.query(createTableSQL);
        console.log('✓ Membership table created successfully\n');

        // Get user IDs for test data
        console.log('[2/3] Fetching user IDs from database...');
        const [users] = await sequelize.query(
            'SELECT id, nom, prenom, email FROM utilisateur LIMIT 5'
        );

        if (users.length === 0) {
            console.log('⚠️  No users found in database. Please create users first.');
            process.exit(1);
        }

        console.log('✓ Found users:');
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ID: ${user.id} - ${user.prenom} ${user.nom} (${user.email})`);
        });
        console.log('');

        // Insert test memberships
        console.log('[3/3] Inserting test memberships...');

        const testMemberships = [
            {
                id_user: users[0]?.id || 1,
                id_club: 1,
                dateend: '2026-06-30 23:59:59',
                typemmbership: 1, // Access
                name: 'Access'
            },
            {
                id_user: users[1]?.id || 2,
                id_club: 1,
                dateend: '2026-12-31 23:59:59',
                typemmbership: 2, // Gold
                name: 'Gold'
            },
            {
                id_user: users[2]?.id || 3,
                id_club: 1,
                dateend: '2027-03-15 23:59:59',
                typemmbership: 3, // Platinum
                name: 'Platinum'
            },
            {
                id_user: users[3]?.id || 4,
                id_club: 1,
                dateend: '2030-12-31 23:59:59',
                typemmbership: 4, // Infinity
                name: 'Infinity'
            }
        ];

        for (const membership of testMemberships) {
            await sequelize.query(
                `INSERT INTO membership (id, id_user, id_club, dateend, typemmbership, created_at, updated_at)
         VALUES (DEFAULT, :id_user, :id_club, :dateend, :typemmbership, NOW(), NOW())
         ON CONFLICT (id_user, id_club) 
         DO UPDATE SET 
           dateend = EXCLUDED.dateend,
           typemmbership = EXCLUDED.typemmbership,
           updated_at = NOW()`,
                {
                    replacements: membership
                }
            );
            console.log(`  ✓ Created ${membership.name} membership for user ID ${membership.id_user}`);
        }

        console.log('');

        // Verify installation
        console.log('Verifying installation...');
        const [memberships] = await sequelize.query(`
      SELECT 
        m.id,
        m.id_user,
        u.nom,
        u.prenom,
        m.dateend,
        m.typemmbership,
        CASE 
          WHEN m.dateend < NOW() THEN 'EXPIRED'
          WHEN m.typemmbership = 0 THEN 'Normal'
          WHEN m.typemmbership = 1 THEN 'Access'
          WHEN m.typemmbership = 2 THEN 'Gold'
          WHEN m.typemmbership = 3 THEN 'Platinum'
          WHEN m.typemmbership = 4 THEN 'Infinity'
        END as membership_type
      FROM membership m
      LEFT JOIN utilisateur u ON m.id_user = u.id
      ORDER BY m.id_user
    `);

        console.log('\n✓ Memberships created:');
        console.table(memberships);

        console.log('\n========================================');
        console.log('Database setup complete! ✓');
        console.log('========================================\n');
        console.log('Next steps:');
        console.log('1. Restart your backend server (Ctrl+C and run: node index.js)');
        console.log('2. Test API: GET http://192.168.1.20:3001/api/memberships/user/' + users[0].id + '/club/1');
        console.log('3. Hot restart your Flutter app');
        console.log('4. Check Profile page for membership display\n');

    } catch (error) {
        console.error('\n❌ Error during setup:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run setup
setupDatabase();

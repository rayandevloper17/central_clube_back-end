/**
 * Drop and Recreate Membership Table - Fresh Start
 * Run with: node recreate_membership_table.js
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: false
    }
);

async function recreateTable() {
    console.log('\n========================================');
    console.log('Recreating Membership Table');
    console.log('========================================\n');

    try {
        await sequelize.authenticate();
        console.log('✓ Connected to database\n');

        // Drop existing table
        console.log('[1/2] Dropping existing membership table...');
        await sequelize.query('DROP TABLE IF EXISTS membership CASCADE');
        console.log('✓ Table dropped\n');

        // Recreate table with proper  structure
        console.log('[2/2] Creating fresh membership table...');
        await sequelize.query(`
      CREATE TABLE membership (
        id BIGSERIAL PRIMARY KEY,
        id_user BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
        id_club BIGINT NOT NULL,
        dateend TIMESTAMP NOT NULL,
        typemmbership INTEGER NOT NULL CHECK (typemmbership >= 0 AND typemmbership <= 4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(id_user, id_club)
      );

      CREATE INDEX idx_membership_user ON membership(id_user);
      CREATE INDEX idx_membership_club ON membership(id_club);
      CREATE INDEX idx_membership_expiry ON membership(dateend);
    `);
        console.log('✓ Table created successfully\n');

        console.log('========================================');
        console.log('✅ Done! Now run: node setup_db.js');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

recreateTable();

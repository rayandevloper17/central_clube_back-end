/**
 * Fix Membership Table Script - Adds missing columns
 * Run with: node fix_membership_table.js
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
        logging: false
    }
);

async function fixMembershipTable() {
    console.log('\n========================================');
    console.log('Fixing Membership Table');
    console.log('========================================\n');

    try {
        // Test connection
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('✓ Connected to database\n');

        // Read and execute fix SQL
        const fixSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'fix_membership_table.sql'),
            'utf8'
        );

        console.log('Applying fixes to membership table...');
        await sequelize.query(fixSQL);
        console.log('✓ Fixes applied successfully\n');

        console.log('========================================');
        console.log('✅ Table fixed! Now run: node setup_db.js');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

fixMembershipTable();

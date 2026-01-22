/**
 * Check membership table schema in SQLite
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

async function checkSchema() {
    try {
        console.log('\n=== CHECKING MEMBERSHIP TABLE SCHEMA ===\n');

        // Check constraints
        const [constraints] = await seq.query(`
            SELECT
                con.conname AS constraint_name,
                con.contype AS constraint_type,
                ARRAY_AGG(att.attname) AS columns
            FROM pg_constraint con
            JOIN pg_class rel ON con.conrelid = rel.oid
            JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
            WHERE rel.relname = 'membership'
            GROUP BY con.conname, con.contype
            ORDER BY con.conname;
        `);

        console.log('Constraints on membership table:');
        console.table(constraints);

        // Check indexes
        const [indexes] = await seq.query(`
            SELECT
                i.relname AS index_name,
                ix.indisunique AS is_unique,
                ARRAY_AGG(a.attname) AS columns
            FROM pg_index ix
            JOIN pg_class i ON ix.indexrelid = i.oid
            JOIN pg_class t ON ix.indrelid = t.oid
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
            WHERE t.relname = 'membership'
            GROUP BY i.relname, ix.indisunique
            ORDER BY i.relname;
        `);

        console.log('\nIndexes on membership table:');
        console.table(indexes);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

checkSchema();

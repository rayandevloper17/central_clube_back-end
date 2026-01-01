import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    // Check for reservation-related tables
    const reservationTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%reservation%' OR table_name LIKE '%plage%')
      ORDER BY table_name;
    `);
    
    console.log('Reservation/Plage tables found:');
    reservationTables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check for any table locks or blocked queries
    const locks = await pool.query(`
      SELECT 
        pg_stat_activity.pid,
        pg_stat_activity.usename,
        pg_stat_activity.query,
        pg_stat_activity.state,
        pg_stat_activity.wait_event_type,
        pg_stat_activity.wait_event
      FROM pg_stat_activity
      WHERE pg_stat_activity.state != 'idle'
      AND pg_stat_activity.query NOT LIKE '%pg_stat_activity%'
      ORDER BY pg_stat_activity.query_start;
    `);
    
    if (locks.rows.length > 0) {
      console.log('\nActive queries (potential blocks):');
      locks.rows.forEach(row => {
        console.log(`- PID ${row.pid}: ${row.query.substring(0, 100)}... (state: ${row.state})`);
        if (row.wait_event_type) {
          console.log(`  Waiting on: ${row.wait_event_type} - ${row.wait_event}`);
        }
      });
    } else {
      console.log('\nNo active queries found.');
    }
    
    // Try to query some basic data
    for (const row of reservationTables.rows) {
      try {
        const count = await pool.query(`SELECT COUNT(*) as count FROM "${row.table_name}"`);
        console.log(`${row.table_name}: ${count.rows[0].count} rows`);
      } catch (err) {
        console.log(`Error querying ${row.table_name}: ${err.message}`);
      }
    }
    
    await pool.end();
    console.log('\nDatabase check completed.');
    
  } catch (err) {
    console.error('Database error:', err.message);
    await pool.end();
  }
}

checkTables();
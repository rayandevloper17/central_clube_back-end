// test-db.js
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  user: "centralclub",
  host: "197.140.16.200",
  database: "centralclubdb",
  password: "UltraSecure#2025!NewP@ssXYZ",
  port: 5432,
  connectionTimeoutMillis: 5000, // 5 ثواني timeout
});

try {
  await client.connect();
  console.log("✅ Connected to PostgreSQL successfully!");
  
  const res = await client.query("SELECT NOW();");
  console.log("🕒 Server Time:", res.rows[0]);

  await client.end();
} catch (err) {
  console.error("❌ Connection FAILED!");
  console.error("Error message:", err.message);
  await client.end();
}

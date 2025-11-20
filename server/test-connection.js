const { sql, getPool } = require('./db/db');

async function test() {
  try {
    console.log('Attempting DB connection...');
    const pool = await getPool();
    console.log('Pool created');
    const result = await pool.request().query('SELECT COUNT(*) as cnt FROM dbo.HumanResources');
    console.log('Query result:', result.recordset);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

test();

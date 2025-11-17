const sql = require('mssql');

// Connection: prefer environment variable DB_CONNECTION; fallback to LocalDB connection string.
const connectionString = process.env.DB_CONNECTION || 'Server=(localdb)\\MSSQLLocalDB;Database=RSTdb1;Trusted_Connection=True;';

const pool = new sql.ConnectionPool(connectionString).connect().then(pool => {
  console.log('Connected to SQL Server for Human-Resource service');
  return pool;
}).catch(err => {
  console.error('Database Connection Failed! Bad Config: ', err);
  throw err;
});

module.exports = { sql, pool };

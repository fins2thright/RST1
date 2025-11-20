const sql = require('mssql');

// Connection configuration for SQL Server Express with SQL authentication
// User: RST1Admin, Password: !QAZxsw23edc
// Uses named pipes protocol which works without SQL Browser service
const config = process.env.DB_CONNECTION
  ? JSON.parse(process.env.DB_CONNECTION)
  : {
      server: 'localhost\\SQLEXPRESS',
      database: 'RSTdb1',
      authentication: {
        type: 'default',
        options: {
          userName: 'RST1Admin',
          password: '!QAZxsw23edc',
        },
      },
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        useUTC: true,
        connectionTimeout: 30000,
        transport: 'tcp',
      },
    };

let poolPromise = null;
function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        console.log('Connected to SQL Server Express for Human-Resource service');
        return pool;
      })
      .catch((err) => {
        console.error('Database Connection Failed:', err.message);
        // reset poolPromise so future attempts can retry
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
}

module.exports = { sql, getPool };

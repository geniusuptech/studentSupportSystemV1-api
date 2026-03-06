const sql = require('mssql');

const config = {
  server: 'localhost\\SQLEXPRESS',
  database: 'StudentWellness',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    integratedSecurity: true
  }
};

async function test() {
  console.log('Testing with tedious config');
  
  try {
    const pool = await sql.connect(config);
    console.log('Connected!');
    
    const result = await pool.request().query('SELECT COUNT(*) as count FROM Students');
    console.log('Result:', result.recordset);
    
    await pool.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
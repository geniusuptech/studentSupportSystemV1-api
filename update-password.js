const bcrypt = require('bcryptjs');

// Generate hash
const password = 'Password123!';
const hash = bcrypt.hashSync(password, 10);

console.log('Generated hash:', hash);
console.log('Hash length:', hash.length);
console.log('Verification:', bcrypt.compareSync(password, hash));

// Now update using raw SQL via mssql/msnodesqlv8
const sql = require('mssql/msnodesqlv8');

const config = {
    server: 'localhost\\SQLEXPRESS',
    database: 'StudentWellness',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};

async function main() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to database');
        
        // Update all coordinator passwords
        const result = await pool.request()
            .input('hash', sql.NVarChar(255), hash)
            .query('UPDATE CoordinatorLogins SET PasswordHash = @hash');
        
        console.log('Coordinators updated:', result.rowsAffected);
        
        // Update all student passwords
        const result2 = await pool.request()
            .input('hash', sql.NVarChar(255), hash)
            .query('UPDATE StudentLogins SET PasswordHash = @hash');
        
        console.log('Students updated:', result2.rowsAffected);
        
        // Verify
        const verify = await pool.request().query('SELECT Email, LEFT(PasswordHash, 30) as HashPrefix FROM CoordinatorLogins');
        console.log('Verify:', verify.recordset);
        
        await sql.close();
    } catch (err) {
        console.error('Error:', err);
        await sql.close();
    }
}

main();

const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=StudentWellness;Trusted_Connection=Yes;`,
};

async function main() {
    try {
        const pool = await sql.connect(config);
        
        // Find all students
        const students = await pool.request().query(`
            SELECT TOP 10 s.StudentID, s.StudentName, s.ContactEmail, sl.Email as LoginEmail
            FROM Students s
            LEFT JOIN StudentLogins sl ON s.StudentID = sl.StudentID
            ORDER BY s.StudentName
        `);
        
        console.log('Students found:');
        console.log(JSON.stringify(students.recordset, null, 2));
        
        // Show password format reminder
        console.log('\nPassword format: GUPS{First2Letters}{SurnameInitial}{Number}');
        console.log('Example for "Aisha Patel": GUPSAIP001');
        
        pool.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();

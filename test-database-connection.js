// test-database-connection.js
// Run this to test your SQL Server connection
require('dotenv').config();
const databaseService = require('./src/config/database.ts').default;

async function testConnection() {
  console.log('🔍 Testing SQL Server Connection...\n');

  try {
    // Test connection
    console.log('📡 Connecting to SQL Server...');
    await databaseService.connect();
    
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    console.log('🧪 Testing query execution...');
    const result = await databaseService.executeQuery('SELECT COUNT(*) as StudentCount FROM Students');
    
    console.log(`✅ Query successful! Found ${result[0].StudentCount} students`);
    
    // Test student data
    const students = await databaseService.executeQuery(`
      SELECT TOP 5 
        StudentName, 
        RiskLevel,
        UniversityID,
        GPA 
      FROM Students 
      ORDER BY StudentName
    `);
    
    console.log('\n📝 Sample Students:');
    students.forEach(student => {
      console.log(`  👤 ${student.StudentName} - Risk: ${student.RiskLevel}, GPA: ${student.GPA}`);
    });

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - Make sure SQL Server is running');
      console.log('   - Check your server address in .env file');
      console.log('   - Verify port 1433 is accessible');
    }
    
    if (error.message.includes('Login failed')) {
      console.log('\n💡 Authentication tips:');
      console.log('   - Check your username and password in .env file');
      console.log('   - Ensure SQL Server authentication is enabled');
    }
  }
}

testConnection();
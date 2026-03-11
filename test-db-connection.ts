// test-db-connection.ts
// Run with: npx ts-node test-db-connection.ts
import databaseService from './src/config/database';

async function testConnection() {
  console.log('Testing SQL Server Connection with mssql package...\n');

  try {
    // Test connection
    console.log('Connecting to SQL Server...');
    await databaseService.connect();
    
    console.log('Connected successfully!\n');
    
    // Test a simple query
    console.log('Testing query execution...');
    const result = await databaseService.executeQuery<{ StudentCount: number }>('SELECT COUNT(*) as StudentCount FROM Students');
    
    console.log(`Query successful! Found ${result[0]?.StudentCount ?? 0} students\n`);
    
    // Test student data
    const students = await databaseService.executeQuery<{ StudentName: string; RiskLevel: string; GPA: number }>(`
      SELECT TOP 5 
        StudentName, 
        RiskLevel,
        GPA 
      FROM Students 
      ORDER BY StudentName
    `);
    
    console.log('Sample Students:');
    students.forEach(student => {
      console.log(`  - ${student.StudentName} | Risk: ${student.RiskLevel} | GPA: ${student.GPA}`);
    });

    // Disconnect
    await databaseService.disconnect();
    console.log('\nTest completed successfully!');

  } catch (error: any) {
    console.error('Connection failed:', error.message);
    
    if (error.message?.includes('ECONNREFUSED')) {
      console.log('\nTroubleshooting tips:');
      console.log('  - Make sure SQL Server is running');
      console.log('  - Check your server address in .env file');
      console.log('  - Verify TCP/IP is enabled in SQL Server Configuration Manager');
    }
    
    if (error.message?.includes('Login failed')) {
      console.log('\nAuthentication tips:');
      console.log('  - Check DB_USER and DB_PASSWORD in .env file');
      console.log('  - Or ensure Windows Authentication is enabled');
    }

    process.exit(1);
  }
}

testConnection();

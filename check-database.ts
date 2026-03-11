import databaseService from './src/config/database';

async function checkDatabase() {
    try {
        console.log('Connecting to database...');
        await databaseService.connect();
        
        // Check what tables exist
        console.log('\n📋 Checking existing tables...');
        const tables = await databaseService.executeQuery(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        
        console.log('Existing tables:');
        tables.forEach(table => console.log(`  - ${table.TABLE_NAME}`));
        
        // Check Users table structure
        console.log('\n🔍 Users table structure:');
        const userColumns = await databaseService.executeQuery(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Users'
            ORDER BY ORDINAL_POSITION
        `);
        
        if (userColumns.length > 0) {
            userColumns.forEach(col => {
                console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });
        } else {
            console.log('  Users table not found');
        }
        
        // Check if any users exist
        console.log('\n👥 Existing users:');
        const users = await databaseService.executeQuery(`
            SELECT UserID, Email, UserType, FirstName, LastName, IsActive
            FROM Users 
            ORDER BY UserID
        `);
        
        if (users.length > 0) {
            users.forEach(user => {
                console.log(`  - ${user.UserID}: ${user.Email} (${user.UserType}) - ${user.FirstName} ${user.LastName} - Active: ${user.IsActive}`);
            });
        } else {
            console.log('  No users found');
        }
        
    } catch (error) {
        console.error('❌ Error checking database:', error);
    }
}

// Run the script
checkDatabase().then(() => {
    console.log('\n✨ Database check completed!');
    process.exit(0);
}).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});
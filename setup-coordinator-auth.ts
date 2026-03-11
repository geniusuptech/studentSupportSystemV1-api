import bcrypt from 'bcryptjs';
import databaseService from './src/config/database';

async function setupCoordinatorAuth() {
    try {
        console.log('Connecting to database...');
        await databaseService.connect();
        
        // Check CoordinatorLogins table structure and data
        console.log('\n📋 Checking CoordinatorLogins table...');
        const coordLoginColumns = await databaseService.executeQuery(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'CoordinatorLogins'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('CoordinatorLogins table structure:');
        coordLoginColumns.forEach((col: any) => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Get all coordinators from Coordinators table
        const coordinators = await databaseService.executeQuery(`
            SELECT c.CoordinatorID, c.CoordinatorName, c.ContactEmail
            FROM Coordinators c
        `);
        
        console.log('\nExisting coordinators:');
        coordinators.forEach((coord: any) => {
            console.log(`  - ID: ${coord.CoordinatorID}, Name: ${coord.CoordinatorName}, Email: ${coord.ContactEmail}`);
        });
        
        // Password format: GUPC + first 2 letters of first name + first letter of surname + padded number
        // (GUPC = Genius UP Coordinator)
        const saltRounds = 12;
        
        console.log('\nPassword format: GUPC{First2Letters}{SurnameInitial}{Number}');
        console.log('Example: GUPCSAM001 for Sarah Mitchell\n');
        
        const credentials: Array<{name: string; email: string; password: string}> = [];
        for (const coord of coordinators) {
            // Parse name: "FirstName LastName" or "FirstName MiddleName LastName"
            const nameParts = coord.CoordinatorName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts[nameParts.length - 1] || '';
            
            // Build password: GUPC + first 2 letters of first name + first letter of last name + CoordinatorID
            const first2 = firstName.substring(0, 2).toUpperCase();
            const last1 = lastName.substring(0, 1).toUpperCase();
            const paddedNum = String(coord.CoordinatorID).padStart(3, '0');
            const password = `GUPC${first2}${last1}${paddedNum}`;
            
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            // Check if login already exists
            const existingLogin = await databaseService.executeQuery(
                'SELECT LoginID FROM CoordinatorLogins WHERE CoordinatorID = @coordinatorId',
                { coordinatorId: coord.CoordinatorID }
            );
            
            if (existingLogin.length === 0) {
                // Create new login
                await databaseService.executeQuery(`
                    INSERT INTO CoordinatorLogins (CoordinatorID, Email, PasswordHash, IsActive, FirstName, LastName)
                    VALUES (@coordinatorId, @email, @passwordHash, 1, @firstName, @lastName)
                `, {
                    coordinatorId: coord.CoordinatorID,
                    email: coord.ContactEmail,
                    passwordHash: passwordHash,
                    firstName: firstName,
                    lastName: lastName
                });
                console.log(`  Created login for: ${coord.ContactEmail} | Password: ${password}`);
            } else {
                // Update existing password
                await databaseService.executeQuery(`
                    UPDATE CoordinatorLogins 
                    SET PasswordHash = @passwordHash, 
                        FailedLoginAttempts = 0, 
                        LockedUntil = NULL,
                        UpdatedAt = GETDATE()
                    WHERE CoordinatorID = @coordinatorId
                `, {
                    coordinatorId: coord.CoordinatorID,
                    passwordHash: passwordHash
                });
                console.log(`  Reset password for: ${coord.ContactEmail} | Password: ${password}`);
            }
            
            credentials.push({
                name: coord.CoordinatorName,
                email: coord.ContactEmail,
                password: password
            });
            
        }
        
        console.log('\n========================================');
        console.log('COORDINATOR AUTHENTICATION SETUP COMPLETE!');
        console.log('========================================\n');
        
        console.log('Coordinator Credentials:');
        console.log('-'.repeat(60));
        credentials.forEach(c => {
            console.log(`  ${c.name}`);
            console.log(`    Email: ${c.email}`);
            console.log(`    Password: ${c.password}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the script
setupCoordinatorAuth().then(() => {
    console.log('\n✨ Coordinator authentication setup completed!');
    process.exit(0);
}).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});


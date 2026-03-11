import databaseService from './src/config/database';

async function linkCoordinatorData() {
    try {
        console.log('Creating coordinator profile data...');
        await databaseService.connect();
        
        // Check if we need to create a coordinators table or use existing structure
        const tables = await databaseService.executeQuery(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME IN ('Coordinators', 'CoordinatorProfiles')
        `);
        
        console.log('Available coordinator tables:', tables.map(t => t.TABLE_NAME));
        
        // Create a simple coordinator profile table if it doesn't exist
        await databaseService.executeQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Coordinators')
            BEGIN
                CREATE TABLE Coordinators (
                    CoordinatorID int IDENTITY(1,1) PRIMARY KEY,
                    CoordinatorName nvarchar(100) NOT NULL,
                    ContactEmail nvarchar(100) NOT NULL UNIQUE,
                    ContactPhone nvarchar(20),
                    Department nvarchar(100),
                    UniversityID int,
                    IsActive bit DEFAULT 1,
                    CreatedAt datetime DEFAULT GETDATE(),
                    UpdatedAt datetime DEFAULT GETDATE()
                )
            END
        `);
        
        // Check if Universities table exists, if not create a simple one
        await databaseService.executeQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Universities' AND COLUMN_NAME IS NOT NULL)
            BEGIN
                IF NOT EXISTS (SELECT * FROM Universities WHERE UniversityID = 1)
                BEGIN
                    INSERT INTO Universities (UniversityName, UniversityCode, Province, City) 
                    VALUES ('University of Cape Town', 'UCT', 'Western Cape', 'Cape Town')
                END
            END
        `);
        
        // Insert coordinator profile
        const coordinatorResult = await databaseService.executeQuery(`
            IF NOT EXISTS (SELECT * FROM Coordinators WHERE ContactEmail = 'sarah.mitchell@uct.ac.za')
            BEGIN
                INSERT INTO Coordinators (CoordinatorName, ContactEmail, ContactPhone, Department, UniversityID)
                OUTPUT INSERTED.CoordinatorID
                VALUES ('Dr. Sarah Mitchell', 'sarah.mitchell@uct.ac.za', '+27 21 650 4321', 'Student Services', 1)
            END
            ELSE
            BEGIN
                SELECT CoordinatorID FROM Coordinators WHERE ContactEmail = 'sarah.mitchell@uct.ac.za'
            END
        `);
        
        let coordinatorId;
        if (coordinatorResult.length > 0) {
            coordinatorId = coordinatorResult[0].CoordinatorID;
        } else {
            // Get existing coordinator ID
            const existing = await databaseService.executeQuery(`
                SELECT CoordinatorID FROM Coordinators WHERE ContactEmail = 'sarah.mitchell@uct.ac.za'
            `);
            coordinatorId = existing[0].CoordinatorID;
        }
        
        console.log(`✅ Coordinator ID: ${coordinatorId}`);
        
        // Update the Users table to link to coordinator
        await databaseService.executeQuery(`
            UPDATE Users 
            SET CoordinatorID = @CoordinatorID, UpdatedAt = GETDATE()
            WHERE Email = 'sarah.mitchell@uct.ac.za'
        `, { CoordinatorID: coordinatorId });
        
        // Verify the final setup
        const finalUser = await databaseService.executeQuery(`
            SELECT 
                u.UserID, u.Email, u.UserType, u.FirstName, u.LastName, 
                u.CoordinatorID, u.IsActive,
                c.CoordinatorName, c.Department, c.UniversityID
            FROM Users u
            LEFT JOIN Coordinators c ON u.CoordinatorID = c.CoordinatorID
            WHERE u.Email = 'sarah.mitchell@uct.ac.za'
        `);
        
        console.log('\n✅ Complete coordinator setup:');
        console.log(finalUser[0]);
        
        console.log('\n🎯 Ready to use coordinator endpoints!');
        console.log('📊 Dashboard: GET /api/coordinators/dashboard');
        console.log('👤 Profile: GET /api/coordinators/profile');
        console.log('👥 Students: GET /api/coordinators/students');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the script
linkCoordinatorData().then(() => {
    console.log('\n🚀 Coordinator setup completed! Try logging in again.');
    process.exit(0);
}).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});
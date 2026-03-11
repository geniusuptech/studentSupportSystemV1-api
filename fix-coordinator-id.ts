import databaseService from './src/config/database';

async function fixCoordinatorId() {
    try {
        console.log('Fixing coordinator ID linkage...');
        await databaseService.connect();
        
        // Create a simple coordinator ID by inserting into CoordinatorLogins if needed
        console.log('📋 Current user status:');
        const currentUser = await databaseService.executeQuery(`
            SELECT UserID, Email, UserType, CoordinatorID, IsActive 
            FROM Users 
            WHERE Email = 'sarah.mitchell@uct.ac.za'
        `);
        console.log(currentUser[0]);
        
        // Check existing coordinator logins to see what IDs are available
        const coordLogins = await databaseService.executeQuery(`
            SELECT LoginID, CoordinatorID, Email 
            FROM CoordinatorLogins
        `);
        console.log('\n📋 Existing coordinator logins:');
        coordLogins.forEach(c => console.log(`ID: ${c.LoginID}, CoordinatorID: ${c.CoordinatorID}, Email: ${c.Email}`));
        
        // Use the first available coordinator ID, or create one
        let coordinatorId = 1; // Default to 1
        
        if (coordLogins.length > 0) {
            // Find an existing coordinator ID we can use, or use the highest + 1
            const existingIds = coordLogins.map(c => c.CoordinatorID);
            coordinatorId = Math.max(...existingIds, 0) + 1;
            console.log(`\n🔄 Assigning new coordinator ID: ${coordinatorId}`);
        }
        
        // Update the Users table with the coordinator ID
        await databaseService.executeQuery(`
            UPDATE Users 
            SET CoordinatorID = @CoordinatorID, UpdatedAt = GETDATE()
            WHERE Email = 'sarah.mitchell@uct.ac.za'
        `, { CoordinatorID: coordinatorId });
        
        // Verify the update worked
        const updatedUser = await databaseService.executeQuery(`
            SELECT UserID, Email, UserType, CoordinatorID, IsActive 
            FROM Users 
            WHERE Email = 'sarah.mitchell@uct.ac.za'
        `);
        
        console.log('\n✅ Updated user:');
        console.log(updatedUser[0]);
        
        console.log('\n🔑 Now login again to get a fresh token with the coordinator ID!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the script
fixCoordinatorId().then(() => {
    console.log('\n🚀 Coordinator ID fix completed!');
    process.exit(0);
}).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});
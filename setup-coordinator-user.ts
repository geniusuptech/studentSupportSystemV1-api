import bcrypt from 'bcryptjs';
import databaseService from './src/config/database';

async function createCoordinatorUser() {
    try {
        console.log('Connecting to database...');
        await databaseService.connect();

        const coordinators = await databaseService.executeQuery(`
            SELECT CoordinatorID, CoordinatorName, ContactEmail, Department
            FROM Coordinators
            WHERE ContactEmail = @Email
        `, { Email: 'sarah.mitchell@uct.ac.za' });

        if (coordinators.length === 0) {
            console.log('Coordinator not found in Coordinators table');
            return;
        }

        const coordinator = coordinators[0];
        console.log('Found coordinator:', coordinator);

        const nameParts = coordinator.CoordinatorName.trim().split(' ');
        const firstNameToken = (nameParts[0] || '').replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase().padEnd(2, 'X');
        const lastNameToken = (nameParts[nameParts.length - 1] || '').replace(/[^a-zA-Z]/g, '').substring(0, 1).toUpperCase().padEnd(1, 'X');
        const password = `GUPC${firstNameToken}${lastNameToken}${String(coordinator.CoordinatorID).padStart(3, '0')}`;

        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const existingUsers = await databaseService.executeQuery(`
            SELECT UserID, Email, UserType, CoordinatorID
            FROM Users
            WHERE Email = @Email
        `, { Email: 'sarah.mitchell@uct.ac.za' });

        if (existingUsers.length > 0) {
            console.log('User already exists, updating...');

            await databaseService.executeQuery(`
                UPDATE Users
                SET PasswordHash = @PasswordHash,
                    CoordinatorID = @CoordinatorID,
                    UserType = 'Coordinator',
                    IsActive = 1,
                    IsEmailVerified = 1,
                    UpdatedAt = GETDATE()
                WHERE Email = @Email
            `, {
                Email: 'sarah.mitchell@uct.ac.za',
                PasswordHash: passwordHash,
                CoordinatorID: coordinator.CoordinatorID
            });

            console.log('Coordinator user updated successfully');
        } else {
            console.log('Creating new user...');

            await databaseService.executeQuery(`
                INSERT INTO Users (
                    Email,
                    PasswordHash,
                    UserType,
                    FirstName,
                    LastName,
                    CoordinatorID,
                    IsActive,
                    IsEmailVerified,
                    CreatedAt,
                    UpdatedAt
                ) VALUES (
                    @Email,
                    @PasswordHash,
                    'Coordinator',
                    @FirstName,
                    @LastName,
                    @CoordinatorID,
                    1,
                    1,
                    GETDATE(),
                    GETDATE()
                )
            `, {
                Email: 'sarah.mitchell@uct.ac.za',
                PasswordHash: passwordHash,
                FirstName: 'Sarah',
                LastName: 'Mitchell',
                CoordinatorID: coordinator.CoordinatorID
            });

            console.log('Coordinator user created successfully');
        }

        const finalUser = await databaseService.executeQuery(`
            SELECT
                u.UserID,
                u.Email,
                u.UserType,
                u.FirstName,
                u.LastName,
                u.CoordinatorID,
                u.IsActive,
                u.IsEmailVerified,
                c.CoordinatorName,
                c.Department,
                c.UniversityID
            FROM Users u
            INNER JOIN Coordinators c ON u.CoordinatorID = c.CoordinatorID
            WHERE u.Email = @Email
        `, { Email: 'sarah.mitchell@uct.ac.za' });

        console.log('Final user record:', finalUser[0]);

        console.log('\nCoordinator Login Credentials:');
        console.log('Email: sarah.mitchell@uct.ac.za');
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('Error creating coordinator user:', error);
    }
}

createCoordinatorUser().then(() => {
    console.log('\nScript completed!');
    process.exit(0);
}).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});

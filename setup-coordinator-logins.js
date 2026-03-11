const bcrypt = require('bcryptjs');
const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const server = process.env.DB_SERVER || 'localhost\\SQLEXPRESS';
const database = process.env.DB_NAME || 'StudentWellness';

const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${server};Database=${database};Trusted_Connection=Yes;`,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

async function main() {
    try {
        console.log('Connecting to database...');
        const pool = await sql.connect(config);
        console.log('Connected!');
        
        // 1. Create CoordinatorLogins table if not exists
        console.log('\n1. Creating CoordinatorLogins table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CoordinatorLogins]') AND type in (N'U'))
            BEGIN
                CREATE TABLE [dbo].[CoordinatorLogins] (
                    [LoginID] INT IDENTITY(1,1) PRIMARY KEY,
                    [CoordinatorID] INT NULL,
                    [Email] NVARCHAR(255) NOT NULL UNIQUE,
                    [PasswordHash] NVARCHAR(255) NOT NULL,
                    [FirstName] NVARCHAR(100) NOT NULL,
                    [LastName] NVARCHAR(100) NOT NULL,
                    [IsActive] BIT NOT NULL DEFAULT 1,
                    [LastLoginAt] DATETIME NULL,
                    [FailedLoginAttempts] INT NOT NULL DEFAULT 0,
                    [LockedUntil] DATETIME NULL,
                    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
                );
                
                CREATE NONCLUSTERED INDEX [IX_CoordinatorLogins_Email] ON [dbo].[CoordinatorLogins]([Email]);
                PRINT 'CoordinatorLogins table created!';
            END
            ELSE
            BEGIN
                PRINT 'CoordinatorLogins table already exists.';
            END
        `);
        console.log('Table ready!');
        
        console.log('\n2. Generating unique passwords with format GUPC{First2}{Last1}{NNN}...');
        
        // 3. Insert sample coordinators
        console.log('\n3. Inserting sample coordinator logins...');
        
        const coordinatorRows = await pool.request().query(`
            SELECT CoordinatorID, CoordinatorName, ContactEmail
            FROM Coordinators
            WHERE IsActive = 1
            ORDER BY CoordinatorID
        `);

        const coordinators = coordinatorRows.recordset.map(row => {
            const nameParts = (row.CoordinatorName || '').trim().split(' ');
            return {
                coordinatorId: row.CoordinatorID,
                email: row.ContactEmail,
                firstName: nameParts[0] || '',
                lastName: nameParts[nameParts.length - 1] || ''
            };
        });

        for (const coord of coordinators) {
            const first2 = (coord.firstName || '').replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase().padEnd(2, 'X');
            const last1 = (coord.lastName || '').replace(/[^a-zA-Z]/g, '').substring(0, 1).toUpperCase().padEnd(1, 'X');
            const paddedNum = String(coord.coordinatorId).padStart(3, '0');
            const password = `GUPC${first2}${last1}${paddedNum}`;
            const passwordHash = await bcrypt.hash(password, 12);

            // Check if exists
            const existing = await pool.request()
                .input('email', sql.NVarChar, coord.email)
                .query('SELECT LoginID FROM CoordinatorLogins WHERE Email = @email');
            
            if (existing.recordset.length === 0) {
                await pool.request()
                    .input('email', sql.NVarChar, coord.email)
                    .input('passwordHash', sql.NVarChar, passwordHash)
                    .input('firstName', sql.NVarChar, coord.firstName)
                    .input('lastName', sql.NVarChar, coord.lastName)
                    .input('coordinatorId', sql.Int, coord.coordinatorId)
                    .query(`
                        INSERT INTO CoordinatorLogins (CoordinatorID, Email, PasswordHash, FirstName, LastName)
                        VALUES (@coordinatorId, @email, @passwordHash, @firstName, @lastName)
                    `);
                console.log(`  Created: ${coord.email} | Password: ${password}`);
            } else {
                // Update password
                await pool.request()
                    .input('email', sql.NVarChar, coord.email)
                    .input('passwordHash', sql.NVarChar, passwordHash)
                    .query('UPDATE CoordinatorLogins SET PasswordHash = @passwordHash WHERE Email = @email');
                console.log(`  Updated: ${coord.email} | Password: ${password}`);
            }

        }
        
        // 4. Display all coordinators
        console.log('\n========================================');
        console.log('COORDINATOR CREDENTIALS');
        console.log('========================================');
        console.log('Password format: GUPC{First2Letters}{SurnameInitial}{Number}');
        console.log('========================================\n');
        
        const allCoords = await pool.request().query('SELECT Email, FirstName, LastName FROM CoordinatorLogins WHERE IsActive = 1');
        console.log('Available logins:');
        allCoords.recordset.forEach(c => {
            console.log(`  - ${c.FirstName} ${c.LastName}: ${c.Email}`);
        });
        
        await sql.close();
        console.log('\nDone!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        await sql.close();
        process.exit(1);
    }
}

main();

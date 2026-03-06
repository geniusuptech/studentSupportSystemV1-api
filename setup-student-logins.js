require('dotenv').config();
const db = require('./src/config/database.ts').default;

(async () => {
  try {
    await db.connect();
    
    console.log('Creating StudentLogins table...');
    
    // Create the table
    await db.executeQuery(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[StudentLogins]') AND type in (N'U'))
      BEGIN
          CREATE TABLE [dbo].[StudentLogins] (
              [LoginID] INT IDENTITY(1,1) PRIMARY KEY,
              [StudentID] INT NOT NULL,
              [Email] NVARCHAR(255) NOT NULL UNIQUE,
              [PasswordHash] NVARCHAR(255) NOT NULL,
              [IsActive] BIT NOT NULL DEFAULT 1,
              [LastLoginAt] DATETIME NULL,
              [FailedLoginAttempts] INT NOT NULL DEFAULT 0,
              [LockedUntil] DATETIME NULL,
              [PasswordResetToken] NVARCHAR(255) NULL,
              [PasswordResetExpires] DATETIME NULL,
              [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
              [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
              
              CONSTRAINT [FK_StudentLogins_Students] FOREIGN KEY ([StudentID]) 
                  REFERENCES [dbo].[Students]([StudentID]) ON DELETE CASCADE
          );
          
          CREATE NONCLUSTERED INDEX [IX_StudentLogins_Email] ON [dbo].[StudentLogins]([Email]);
      END
    `);
    
    console.log('StudentLogins table created!');
    
    // Insert sample login data for existing students
    // Password is 'Password123!' for all students
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('Password123!', 10);
    
    console.log('Inserting sample login credentials for existing students...');
    
    // Get all students
    const students = await db.executeQuery('SELECT StudentID, ContactEmail FROM Students');
    
    for (const student of students) {
      // Check if login already exists
      const existing = await db.executeQuery(
        'SELECT LoginID FROM StudentLogins WHERE StudentID = @studentId',
        { studentId: student.StudentID }
      );
      
      if (existing.length === 0) {
        await db.executeQuery(`
          INSERT INTO StudentLogins (StudentID, Email, PasswordHash)
          VALUES (@studentId, @email, @passwordHash)
        `, {
          studentId: student.StudentID,
          email: student.ContactEmail,
          passwordHash: passwordHash
        });
        console.log(`  Created login for: ${student.ContactEmail}`);
      } else {
        console.log(`  Login already exists for: ${student.ContactEmail}`);
      }
    }
    
    console.log('\nDone! All students can now login with:');
    console.log('  Email: their university email');
    console.log('  Password: Password123!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

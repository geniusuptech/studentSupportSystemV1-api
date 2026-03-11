require('dotenv').config();
require('ts-node/register/transpile-only');
const db = require('./src/config/database.ts').default;

(async () => {
  try {
    await db.connect();
    
    // Step 1: Add Module columns if they don't exist
    console.log('Adding Module columns to Students table...');
    await db.executeQuery(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Students') AND name = 'Module1')
      BEGIN
          ALTER TABLE Students ADD 
              Module1 NVARCHAR(100) NULL,
              Module2 NVARCHAR(100) NULL,
              Module3 NVARCHAR(100) NULL,
              Module4 NVARCHAR(100) NULL;
          PRINT 'Module columns added';
      END
    `);
    console.log('Module columns ready!');

    // Step 2: Create StudentLogins table
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
    // Password format: GUPS + first 2 letters of first name + first letter of surname + 3-digit increment
    const bcrypt = require('bcryptjs');
    
    console.log('Setting up login credentials for all students...');
    console.log('Password format: GUPS{First2LettersOfName}{FirstLetterOfSurname}{Number}\n');
    
    // Get all students ordered by name for consistent numbering
    const students = await db.executeQuery('SELECT StudentID, StudentName, ContactEmail FROM Students ORDER BY StudentName');
    
    let counter = 1;
    const credentials = [];
    
    for (const student of students) {
      // Parse name: "FirstName LastName" or "FirstName MiddleName LastName"
      const nameParts = student.StudentName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts[nameParts.length - 1] || '';
      
      // Build password: GUPS + first 2 letters of first name + first letter of last name + padded number
      const first2 = firstName.substring(0, 2).toUpperCase();
      const last1 = lastName.substring(0, 1).toUpperCase();
      const paddedNum = String(counter).padStart(3, '0');
      const password = `GUPS${first2}${last1}${paddedNum}`;
      
      const passwordHash = await bcrypt.hash(password, 10);
      
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
        console.log(`  Created login for: ${student.ContactEmail} | Password: ${password}`);
      } else {
        // Update existing password to new value
        await db.executeQuery(`
          UPDATE StudentLogins 
          SET PasswordHash = @passwordHash, 
              FailedLoginAttempts = 0, 
              LockedUntil = NULL,
              UpdatedAt = GETDATE()
          WHERE StudentID = @studentId
        `, {
          studentId: student.StudentID,
          passwordHash: passwordHash
        });
        console.log(`  Reset password for: ${student.ContactEmail} | Password: ${password}`);
      }
      
      credentials.push({
        name: student.StudentName,
        email: student.ContactEmail,
        password: password
      });
      
      counter++;
    }
    
    console.log('\n========================================');
    console.log('ONBOARDING READY!');
    console.log('========================================');
    console.log('Password format: GUPS{First2Letters}{SurnameInitial}{Number}');
    console.log('========================================\n');
    
    console.log('Student Credentials:');
    console.log('-'.repeat(60));
    credentials.forEach(c => {
      console.log(`  ${c.name}`);
      console.log(`    Email: ${c.email}`);
      console.log(`    Password: ${c.password}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

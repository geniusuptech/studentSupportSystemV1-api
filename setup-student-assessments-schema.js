require('dotenv').config();
require('ts-node/register/transpile-only');
const db = require('./src/config/database.ts').default;

const statements = [
  `
  IF OBJECT_ID(N'dbo.AssessmentTypes', N'U') IS NULL
  BEGIN
      CREATE TABLE dbo.AssessmentTypes (
          AssessmentTypeID INT IDENTITY(1,1) PRIMARY KEY,
          AssessmentTypeName NVARCHAR(50) NOT NULL UNIQUE,
          IsActive BIT NOT NULL DEFAULT 1,
          CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
      );
  END
  `,
  `
  IF OBJECT_ID(N'dbo.AssessmentStatuses', N'U') IS NULL
  BEGIN
      CREATE TABLE dbo.AssessmentStatuses (
          AssessmentStatusID INT IDENTITY(1,1) PRIMARY KEY,
          StatusName NVARCHAR(30) NOT NULL UNIQUE,
          IsActive BIT NOT NULL DEFAULT 1,
          CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
      );
  END
  `,
  `
  IF OBJECT_ID(N'dbo.StudentAssessments', N'U') IS NULL
  BEGIN
      CREATE TABLE dbo.StudentAssessments (
          StudentAssessmentID INT IDENTITY(1,1) PRIMARY KEY,
          StudentID INT NOT NULL,
          SubjectName NVARCHAR(150) NOT NULL,
          AssessmentTypeID INT NOT NULL,
          GradePercentage DECIMAL(5,2) NOT NULL,
          AssessmentStatusID INT NOT NULL,
          SubmissionDate DATE NOT NULL,
          Notes NVARCHAR(500) NULL,
          CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
          UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT FK_StudentAssessments_Students
              FOREIGN KEY (StudentID) REFERENCES dbo.Students(StudentID),
          CONSTRAINT FK_StudentAssessments_AssessmentTypes
              FOREIGN KEY (AssessmentTypeID) REFERENCES dbo.AssessmentTypes(AssessmentTypeID),
          CONSTRAINT FK_StudentAssessments_AssessmentStatuses
              FOREIGN KEY (AssessmentStatusID) REFERENCES dbo.AssessmentStatuses(AssessmentStatusID),
          CONSTRAINT CHK_StudentAssessments_GradeRange
              CHECK (GradePercentage >= 0 AND GradePercentage <= 100)
      );
  END
  `,
  `
  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_StudentAssessments_StudentID_SubmissionDate' AND object_id = OBJECT_ID(N'dbo.StudentAssessments'))
  BEGIN
      CREATE NONCLUSTERED INDEX IX_StudentAssessments_StudentID_SubmissionDate
          ON dbo.StudentAssessments(StudentID, SubmissionDate DESC);
  END
  `,
  `
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentTypes WHERE AssessmentTypeName = 'Test')
      INSERT INTO dbo.AssessmentTypes (AssessmentTypeName) VALUES ('Test');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentTypes WHERE AssessmentTypeName = 'Assignment')
      INSERT INTO dbo.AssessmentTypes (AssessmentTypeName) VALUES ('Assignment');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentTypes WHERE AssessmentTypeName = 'Quiz')
      INSERT INTO dbo.AssessmentTypes (AssessmentTypeName) VALUES ('Quiz');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentTypes WHERE AssessmentTypeName = 'Mid-Term Exam')
      INSERT INTO dbo.AssessmentTypes (AssessmentTypeName) VALUES ('Mid-Term Exam');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentTypes WHERE AssessmentTypeName = 'Final Exam')
      INSERT INTO dbo.AssessmentTypes (AssessmentTypeName) VALUES ('Final Exam');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentTypes WHERE AssessmentTypeName = 'Project')
      INSERT INTO dbo.AssessmentTypes (AssessmentTypeName) VALUES ('Project');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentTypes WHERE AssessmentTypeName = 'Lab Report')
      INSERT INTO dbo.AssessmentTypes (AssessmentTypeName) VALUES ('Lab Report');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentTypes WHERE AssessmentTypeName = 'Semester Mark')
      INSERT INTO dbo.AssessmentTypes (AssessmentTypeName) VALUES ('Semester Mark');
  `,
  `
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentStatuses WHERE StatusName = 'Pending')
      INSERT INTO dbo.AssessmentStatuses (StatusName) VALUES ('Pending');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentStatuses WHERE StatusName = 'Passed')
      INSERT INTO dbo.AssessmentStatuses (StatusName) VALUES ('Passed');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentStatuses WHERE StatusName = 'Failed')
      INSERT INTO dbo.AssessmentStatuses (StatusName) VALUES ('Failed');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentStatuses WHERE StatusName = 'Incomplete')
      INSERT INTO dbo.AssessmentStatuses (StatusName) VALUES ('Incomplete');
  IF NOT EXISTS (SELECT 1 FROM dbo.AssessmentStatuses WHERE StatusName = 'Under Review')
      INSERT INTO dbo.AssessmentStatuses (StatusName) VALUES ('Under Review');
  `,
];

async function run() {
  try {
    await db.connect();
    console.log('Connected. Creating student assessment schema...');

    for (const statement of statements) {
      await db.executeQuery(statement);
    }

    const typeRows = await db.executeQuery(`
      SELECT AssessmentTypeID, AssessmentTypeName
      FROM dbo.AssessmentTypes
      ORDER BY AssessmentTypeID;
    `);

    const statusRows = await db.executeQuery(`
      SELECT AssessmentStatusID, StatusName
      FROM dbo.AssessmentStatuses
      ORDER BY AssessmentStatusID;
    `);

    const tableRows = await db.executeQuery(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_NAME IN ('AssessmentTypes', 'AssessmentStatuses', 'StudentAssessments')
      ORDER BY TABLE_NAME;
    `);

    console.log('Student assessment schema is ready.');
    console.log('Tables:', tableRows.map((row) => row.TABLE_NAME).join(', '));
    console.log('Assessment types:', typeRows.length);
    typeRows.forEach((row) => console.log(` - ${row.AssessmentTypeID}: ${row.AssessmentTypeName}`));
    console.log('Assessment statuses:', statusRows.length);
    statusRows.forEach((row) => console.log(` - ${row.AssessmentStatusID}: ${row.StatusName}`));
  } catch (error) {
    console.error('Failed to setup student assessment schema:', error);
    process.exitCode = 1;
  } finally {
    try {
      await db.disconnect();
    } catch {
      // ignore disconnect errors
    }
  }
}

run();

require('dotenv').config();
require('ts-node/register/transpile-only');

const db = require('./src/config/database.ts').default;

const statements = [
  `
  IF OBJECT_ID(N'dbo.Partners', N'U') IS NULL
  BEGIN
      CREATE TABLE dbo.Partners (
          PartnerID INT IDENTITY(1,1) PRIMARY KEY,
          PartnerName NVARCHAR(100) NOT NULL,
          PartnerType NVARCHAR(50) NOT NULL,
          Specialization NVARCHAR(255) NULL,
          ContactEmail NVARCHAR(100) NULL,
          ContactPhone NVARCHAR(20) NULL,
          IsAvailable BIT NOT NULL DEFAULT 1,
          MaxCapacity INT NOT NULL DEFAULT 20,
          CurrentWorkload INT NOT NULL DEFAULT 0,
          Rating DECIMAL(3,2) NULL,
          YearsOfExperience INT NULL,
          HourlyRate DECIMAL(10,2) NULL,
          Location NVARCHAR(100) NULL,
          CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
          UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
      );
  END
  `,
  `
  IF OBJECT_ID(N'dbo.SupportRequestCategories', N'U') IS NULL
  BEGIN
      CREATE TABLE dbo.SupportRequestCategories (
          CategoryID INT IDENTITY(1,1) PRIMARY KEY,
          CategoryName NVARCHAR(50) NOT NULL UNIQUE,
          CategoryDescription NVARCHAR(255),
          DefaultPriority NVARCHAR(20) DEFAULT 'Medium',
          IsActive BIT NOT NULL DEFAULT 1,
          CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
      );
  END
  `,
  `
  IF OBJECT_ID(N'dbo.SupportRequests', N'U') IS NULL
  BEGIN
      CREATE TABLE dbo.SupportRequests (
          RequestID INT IDENTITY(1,1) PRIMARY KEY,
          StudentID INT NOT NULL,
          CategoryID INT NOT NULL,
          Title NVARCHAR(200) NOT NULL,
          Description NVARCHAR(2000) NOT NULL,
          Priority NVARCHAR(20) NOT NULL DEFAULT 'Medium',
          Status NVARCHAR(20) NOT NULL DEFAULT 'Open',
          AssignedPartnerID INT NULL,
          CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
          UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
          ResolvedAt DATETIME2 NULL,
          Notes NVARCHAR(2000),
          CONSTRAINT FK_SupportRequests_Student
              FOREIGN KEY (StudentID) REFERENCES dbo.Students(StudentID),
          CONSTRAINT FK_SupportRequests_Category
              FOREIGN KEY (CategoryID) REFERENCES dbo.SupportRequestCategories(CategoryID),
          CONSTRAINT FK_SupportRequests_Partner
              FOREIGN KEY (AssignedPartnerID) REFERENCES dbo.Partners(PartnerID),
          CONSTRAINT CHK_SupportRequests_Priority
              CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical')),
          CONSTRAINT CHK_SupportRequests_Status
              CHECK (Status IN ('Open', 'In Progress', 'Resolved', 'Closed'))
      );
  END
  `,
  `
  IF NOT EXISTS (SELECT 1 FROM dbo.SupportRequestCategories WHERE CategoryName = 'Academic Support')
      INSERT INTO dbo.SupportRequestCategories (CategoryName, CategoryDescription, DefaultPriority)
      VALUES ('Academic Support', 'Help with coursework, tutoring, study skills', 'Medium');
  `,
  `
  IF NOT EXISTS (SELECT 1 FROM dbo.SupportRequestCategories WHERE CategoryName = 'Mental Health')
      INSERT INTO dbo.SupportRequestCategories (CategoryName, CategoryDescription, DefaultPriority)
      VALUES ('Mental Health', 'Counseling, stress management, emotional support', 'High');
  `,
  `
  IF NOT EXISTS (SELECT 1 FROM dbo.SupportRequestCategories WHERE CategoryName = 'Financial Aid')
      INSERT INTO dbo.SupportRequestCategories (CategoryName, CategoryDescription, DefaultPriority)
      VALUES ('Financial Aid', 'Assistance with fees, bursaries, financial planning', 'Medium');
  `,
  `
  IF NOT EXISTS (SELECT 1 FROM dbo.SupportRequestCategories WHERE CategoryName = 'Career Guidance')
      INSERT INTO dbo.SupportRequestCategories (CategoryName, CategoryDescription, DefaultPriority)
      VALUES ('Career Guidance', 'Career counseling, job search, internship support', 'Low');
  `,
];

async function run() {
  try {
    await db.connect();
    console.log('Connected. Ensuring support schema...');

    for (const statement of statements) {
      await db.executeQuery(statement);
    }

    const tables = await db.executeQuery(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_NAME IN ('Partners', 'SupportRequestCategories', 'SupportRequests')
      ORDER BY TABLE_NAME;
    `);

    const categories = await db.executeQuery(`
      SELECT CategoryID, CategoryName, DefaultPriority
      FROM dbo.SupportRequestCategories
      ORDER BY CategoryID;
    `);

    console.log('Support schema ready.');
    console.log('Tables:', tables.map(t => t.TABLE_NAME).join(', '));
    console.log('Categories:', categories.length);
    categories.forEach(c => {
      console.log(` - ${c.CategoryID}: ${c.CategoryName} (${c.DefaultPriority})`);
    });
  } catch (error) {
    console.error('Failed to setup support schema:', error);
    process.exitCode = 1;
  } finally {
    try {
      await db.disconnect();
    } catch {
      // ignore disconnect errors in setup script
    }
  }
}

run();

-- ============================================================================
-- Users Table Creation Script for Authentication
-- ============================================================================
-- This script creates the Users table for authentication in the
-- Student Wellness Dashboard system.
-- ============================================================================

USE StudentWellness;
GO

-- ============================================================================
-- 1. CREATE USERS TABLE
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE Users (
        UserID              INT PRIMARY KEY IDENTITY(1,1),
        Email               NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash        NVARCHAR(255) NOT NULL,
        UserType            NVARCHAR(20) NOT NULL CHECK (UserType IN ('Student', 'Coordinator', 'Partner', 'Admin')),
        FirstName           NVARCHAR(100) NOT NULL,
        LastName            NVARCHAR(100) NOT NULL,
        ProfilePictureURL   NVARCHAR(500),
        IsActive            BIT DEFAULT 1 NOT NULL,
        IsEmailVerified     BIT DEFAULT 0 NOT NULL,
        LastLoginDate       DATETIME,
        CreatedAt           DATETIME DEFAULT GETDATE() NOT NULL,
        UpdatedAt           DATETIME DEFAULT GETDATE() NOT NULL,
        -- Foreign key references to related entities
        StudentID           INT FOREIGN KEY REFERENCES Students(StudentID),
        CoordinatorID       INT FOREIGN KEY REFERENCES Coordinators(CoordinatorID),
        PartnerID           INT FOREIGN KEY REFERENCES Partners(PartnerID)
    );
    
    PRINT 'Users table created successfully.';
END
ELSE
BEGIN
    PRINT 'Users table already exists.';
END
GO

-- ============================================================================
-- 2. CREATE COORDINATORS TABLE (if not exists)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Coordinators]') AND type in (N'U'))
BEGIN
    CREATE TABLE Coordinators (
        CoordinatorID       INT PRIMARY KEY IDENTITY(1,1),
        CoordinatorName     NVARCHAR(255) NOT NULL,
        ContactEmail        NVARCHAR(255) NOT NULL,
        ContactPhone        NVARCHAR(20),
        UniversityID        INT FOREIGN KEY REFERENCES Universities(UniversityID),
        Department          NVARCHAR(255),
        IsActive            BIT DEFAULT 1,
        CreatedAt           DATETIME DEFAULT GETDATE(),
        UpdatedAt           DATETIME DEFAULT GETDATE()
    );
    
    PRINT 'Coordinators table created successfully.';
END
ELSE
BEGIN
    PRINT 'Coordinators table already exists.';
END
GO

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_UserType ON Users(UserType);
CREATE INDEX IX_Users_IsActive ON Users(IsActive);
CREATE INDEX IX_Users_StudentID ON Users(StudentID);
CREATE INDEX IX_Users_CoordinatorID ON Users(CoordinatorID);
CREATE INDEX IX_Users_PartnerID ON Users(PartnerID);
CREATE INDEX IX_Users_LastLoginDate ON Users(LastLoginDate DESC);

-- ============================================================================
-- 4. INSERT SAMPLE COORDINATORS
-- ============================================================================
INSERT INTO Coordinators (CoordinatorName, ContactEmail, ContactPhone, UniversityID, Department, IsActive) VALUES
('Dr. Sarah Mitchell', 'sarah.mitchell@uct.ac.za', '+27 21 650 4321', 1, 'Student Services', 1),
('Prof. David Johnson', 'david.johnson@wits.ac.za', '+27 11 717 5678', 2, 'Student Affairs', 1),
('Ms. Priya Singh', 'priya.singh@uj.ac.za', '+27 11 559 7890', 3, 'Academic Support', 1),
('Dr. Nomsa Dlamini', 'nomsa.dlamini@ukzn.ac.za', '+27 31 260 1234', 4, 'Wellness Centre', 1),
('Prof. Johan van Zyl', 'johan.vanzyl@sun.ac.za', '+27 21 808 5432', 5, 'Student Development', 1),
('Dr. Maria Gonzalez', 'maria.gonzalez@up.ac.za', '+27 12 420 6789', 6, 'Student Life', 1);

-- ============================================================================
-- 5. INSERT SAMPLE USERS FOR AUTHENTICATION
-- ============================================================================

-- Temporary bootstrap password is 'TempPass!123' (bcrypt 12 rounds)
-- Immediately run setup-users-auth.ts to generate unique role-based passwords.
DECLARE @SamplePasswordHash NVARCHAR(255) = '$2a$12$W4G5mbzQHrLENhqAusil8eYUOOtT5ZUOa/lTgDR9hokDWFDBLT2aS';

INSERT INTO Users (Email, PasswordHash, UserType, FirstName, LastName, CoordinatorID, IsActive, IsEmailVerified) VALUES
('sarah.mitchell@uct.ac.za', @SamplePasswordHash, 'Coordinator', 'Sarah', 'Mitchell', 1, 1, 1),
('david.johnson@wits.ac.za', @SamplePasswordHash, 'Coordinator', 'David', 'Johnson', 2, 1, 1),
('priya.singh@uj.ac.za', @SamplePasswordHash, 'Coordinator', 'Priya', 'Singh', 3, 1, 1),
('nomsa.dlamini@ukzn.ac.za', @SamplePasswordHash, 'Coordinator', 'Nomsa', 'Dlamini', 4, 1, 1);

-- Sample admin user
INSERT INTO Users (Email, PasswordHash, UserType, FirstName, LastName, IsActive, IsEmailVerified) VALUES
('admin@studentwellness.com', @SamplePasswordHash, 'Admin', 'System', 'Administrator', 1, 1);

-- Sample student users (linking to existing students when available)
INSERT INTO Users (Email, PasswordHash, UserType, FirstName, LastName, StudentID, IsActive, IsEmailVerified) VALUES
('lerato.khumalo@students.uct.ac.za', @SamplePasswordHash, 'Student', 'Lerato', 'Khumalo', NULL, 1, 0),
('thabo.mthembu@students.uj.ac.za', @SamplePasswordHash, 'Student', 'Thabo', 'Mthembu', NULL, 1, 0),
('jessica.naidoo@students.ukzn.ac.za', @SamplePasswordHash, 'Student', 'Jessica', 'Naidoo', NULL, 1, 0);

-- Sample partner users (linking to existing partners when available)  
INSERT INTO Users (Email, PasswordHash, UserType, FirstName, LastName, PartnerID, IsActive, IsEmailVerified) VALUES
('michael.chen@uct.ac.za', @SamplePasswordHash, 'Partner', 'Michael', 'Chen', NULL, 1, 1),
('sarah.williams@wits.ac.za', @SamplePasswordHash, 'Partner', 'Sarah', 'Williams', NULL, 1, 1);

-- ============================================================================
-- 6. UPDATE FOREIGN KEY REFERENCES (if Students/Partners exist)
-- ============================================================================

-- Update student user links when Students table has data
-- This should be run after Students table is populated with the coordinator_dashboard_sample_data.sql
/*
UPDATE u SET u.StudentID = s.StudentID 
FROM Users u 
INNER JOIN Students s ON (
    (u.FirstName = 'Lerato' AND u.LastName = 'Khumalo' AND s.StudentName LIKE '%Lerato%Khumalo%') OR
    (u.FirstName = 'Thabo' AND u.LastName = 'Mthembu' AND s.StudentName LIKE '%Thabo%Mthembu%') OR
    (u.FirstName = 'Jessica' AND u.LastName = 'Naidoo' AND s.StudentName LIKE '%Jessica%Naidoo%')
)
WHERE u.UserType = 'Student' AND u.StudentID IS NULL;
*/

-- Update partner user links when Partners table has data  
-- This should be run after Partners table is populated with the partners_table_script.sql
/*
UPDATE u SET u.PartnerID = p.PartnerID
FROM Users u
INNER JOIN Partners p ON (
    (u.FirstName = 'Michael' AND u.LastName = 'Chen' AND p.PartnerName LIKE '%Michael%Chen%') OR
    (u.FirstName = 'Sarah' AND u.LastName = 'Williams' AND p.PartnerName LIKE '%Sarah%Williams%')
)
WHERE u.UserType = 'Partner' AND u.PartnerID IS NULL;
*/

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================
PRINT 'Users Data Population Complete!'
PRINT '================================'

-- Show user statistics
SELECT 
    UserType,
    COUNT(*) as UserCount,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as ActiveUsers,
    SUM(CASE WHEN IsEmailVerified = 1 THEN 1 ELSE 0 END) as VerifiedUsers,
    COUNT(CASE WHEN LastLoginDate IS NOT NULL THEN 1 END) as UsersWithLogin
FROM Users 
GROUP BY UserType
ORDER BY UserCount DESC;

-- Show all users (without password hashes)
SELECT 
    UserID,
    Email,
    UserType,
    FirstName + ' ' + LastName as FullName,
    IsActive,
    IsEmailVerified,
    LastLoginDate,
    CreatedAt
FROM Users 
ORDER BY CreatedAt DESC;

-- Show coordinators with their user accounts
SELECT 
    c.CoordinatorID,
    c.CoordinatorName,
    c.ContactEmail,
    u.UserID,
    u.Email as UserEmail,
    u.IsActive as UserActive,
    u.LastLoginDate
FROM Coordinators c
    LEFT JOIN Users u ON c.CoordinatorID = u.CoordinatorID
ORDER BY c.CoordinatorName;

PRINT ''
PRINT 'Sample users created with temporary credentials.'
PRINT 'Next step: run `npm run setup:users-auth` to generate unique passwords per role.'
PRINT 'Formats: Student=GUPS..., Coordinator=GUPC..., Partner=GUPP..., Admin=GUPA...'
PRINT ''
PRINT 'IMPORTANT: Do not use temporary passwords in production.'
PRINT 'Users table ready for authentication endpoints.'

GO


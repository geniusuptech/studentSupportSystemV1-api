-- ============================================================================
-- Student Wellness Dashboard - Complete Database Schema
-- ============================================================================
-- This script creates the complete database structure for the Student Wellness Dashboard
-- including all tables, initial data, views, stored procedures, and indexes.
--
-- Version: 1.0
-- Created: 2024
-- Database: SQL Server 2019+
-- ============================================================================

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StudentWellnessDB')
BEGIN
    CREATE DATABASE StudentWellnessDB;
END
GO

USE StudentWellnessDB;
GO

-- ============================================================================
-- DROP EXISTING OBJECTS (for clean reinstall)
-- ============================================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SupportLogs]') AND type in (N'U'))
DROP TABLE [dbo].[SupportLogs];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SupportRequests]') AND type in (N'U'))
DROP TABLE [dbo].[SupportRequests];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[StudentProfiles]') AND type in (N'U'))
DROP TABLE [dbo].[StudentProfiles];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Students]') AND type in (N'U'))
DROP TABLE [dbo].[Students];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Partners]') AND type in (N'U'))
DROP TABLE [dbo].[Partners];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SupportRequestCategories]') AND type in (N'U'))
DROP TABLE [dbo].[SupportRequestCategories];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Programs]') AND type in (N'U'))
DROP TABLE [dbo].[Programs];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Universities]') AND type in (N'U'))
DROP TABLE [dbo].[Universities];
GO

-- ============================================================================
-- TABLE CREATION
-- ============================================================================

-- Universities Table
CREATE TABLE Universities (
    UniversityID INT IDENTITY(1,1) PRIMARY KEY,
    UniversityName NVARCHAR(100) NOT NULL UNIQUE,
    UniversityCode NVARCHAR(10) NOT NULL UNIQUE,
    Location NVARCHAR(100),
    Website NVARCHAR(255),
    ContactEmail NVARCHAR(100),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Programs Table
CREATE TABLE Programs (
    ProgramID INT IDENTITY(1,1) PRIMARY KEY,
    ProgramName NVARCHAR(100) NOT NULL,
    ProgramCode NVARCHAR(20) NOT NULL,
    Department NVARCHAR(100),
    DurationYears INT NOT NULL DEFAULT 3,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Partners Table (Service Providers/Tutors)
CREATE TABLE Partners (
    PartnerID INT IDENTITY(1,1) PRIMARY KEY,
    PartnerName NVARCHAR(100) NOT NULL,
    PartnerType NVARCHAR(50) NOT NULL, -- 'Tutor', 'Counselor', 'Mentor', 'Service Provider'
    Specialization NVARCHAR(200),
    ContactEmail NVARCHAR(100) NOT NULL,
    ContactPhone NVARCHAR(20),
    IsAvailable BIT NOT NULL DEFAULT 1,
    MaxCapacity INT NOT NULL DEFAULT 10,
    CurrentWorkload INT NOT NULL DEFAULT 0,
    Rating DECIMAL(3,2) DEFAULT 0.00,
    YearsOfExperience INT DEFAULT 0,
    HourlyRate DECIMAL(8,2),
    Location NVARCHAR(100),
    Bio NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CHK_Rating CHECK (Rating >= 0 AND Rating <= 5.00),
    CONSTRAINT CHK_Workload CHECK (CurrentWorkload >= 0 AND CurrentWorkload <= MaxCapacity)
);

-- Support Request Categories
CREATE TABLE SupportRequestCategories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(50) NOT NULL UNIQUE,
    CategoryDescription NVARCHAR(255),
    DefaultPriority NVARCHAR(20) DEFAULT 'Medium',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Students Table
CREATE TABLE Students (
    StudentID INT IDENTITY(1,1) PRIMARY KEY,
    StudentName NVARCHAR(100) NOT NULL,
    StudentNumber NVARCHAR(20) NOT NULL UNIQUE,
    UniversityID INT NOT NULL,
    ProgramID INT NOT NULL,
    YearOfStudy INT NOT NULL,
    GPA DECIMAL(3,2) CHECK (GPA >= 0 AND GPA <= 4.00),
    RiskLevel NVARCHAR(20) NOT NULL DEFAULT 'Safe', -- 'Safe', 'At Risk', 'Critical'
    ContactEmail NVARCHAR(100) NOT NULL,
    ContactPhone NVARCHAR(20),
    EmergencyContact NVARCHAR(100),
    EmergencyPhone NVARCHAR(20),
    DateEnrolled DATE NOT NULL,
    LastLoginDate DATETIME2,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UniversityID) REFERENCES Universities(UniversityID),
    FOREIGN KEY (ProgramID) REFERENCES Programs(ProgramID),
    CONSTRAINT CHK_YearOfStudy CHECK (YearOfStudy >= 1 AND YearOfStudy <= 6),
    CONSTRAINT CHK_RiskLevel CHECK (RiskLevel IN ('Safe', 'At Risk', 'Critical'))
);

-- Support Requests Table
CREATE TABLE SupportRequests (
    RequestID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT NOT NULL,
    CategoryID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000) NOT NULL,
    Priority NVARCHAR(20) NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    Status NVARCHAR(20) NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    AssignedPartnerID INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    ResolvedAt DATETIME2 NULL,
    Notes NVARCHAR(2000),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (CategoryID) REFERENCES SupportRequestCategories(CategoryID),
    FOREIGN KEY (AssignedPartnerID) REFERENCES Partners(PartnerID),
    CONSTRAINT CHK_Priority CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical')),
    CONSTRAINT CHK_Status CHECK (Status IN ('Open', 'In Progress', 'Resolved', 'Closed'))
);

-- Support Logs Table (Session tracking)
CREATE TABLE SupportLogs (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    RequestID INT NOT NULL,
    PartnerID INT NOT NULL,
    SessionDate DATETIME2 NOT NULL,
    Duration INT, -- Duration in minutes
    SessionType NVARCHAR(50), -- 'Individual', 'Group', 'Online', 'Phone'
    Notes NVARCHAR(1000),
    Outcome NVARCHAR(50), -- 'Positive', 'Neutral', 'Needs Follow-up'
    FollowUpRequired BIT DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (RequestID) REFERENCES SupportRequests(RequestID),
    FOREIGN KEY (PartnerID) REFERENCES Partners(PartnerID)
);

-- Student Profiles Table (Display profiles for dashboard)
CREATE TABLE StudentProfiles (
    ProfileID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT NOT NULL,
    ProfilePictureURL NVARCHAR(500),
    Bio NVARCHAR(500),
    Interests NVARCHAR(500),
    Goals NVARCHAR(500),
    Achievements NVARCHAR(1000),
    PreferredContactMethod NVARCHAR(50) DEFAULT 'Email',
    IsPublic BIT DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
);

-- ============================================================================
-- INITIAL DATA INSERTION
-- ============================================================================

-- Insert Universities
INSERT INTO Universities (UniversityName, UniversityCode, Location, Website, ContactEmail) VALUES
('University of Cape Town', 'UCT', 'Cape Town, Western Cape', 'https://www.uct.ac.za', 'info@uct.ac.za'),
('University of the Witwatersrand', 'WITS', 'Johannesburg, Gauteng', 'https://www.wits.ac.za', 'info@wits.ac.za'),
('University of Johannesburg', 'UJ', 'Johannesburg, Gauteng', 'https://www.uj.ac.za', 'info@uj.ac.za'),
('University of KwaZulu-Natal', 'UKZN', 'Durban, KwaZulu-Natal', 'https://www.ukzn.ac.za', 'info@ukzn.ac.za');

-- Insert Programs
INSERT INTO Programs (ProgramName, ProgramCode, Department, DurationYears) VALUES
('Computer Science', 'CS', 'Computer Science', 3),
('Business Administration', 'BA', 'Business School', 3),
('Engineering', 'ENG', 'Engineering', 4),
('Medicine', 'MED', 'Health Sciences', 6),
('Psychology', 'PSY', 'Psychology', 3),
('Law', 'LAW', 'Law School', 4);

-- Insert Support Request Categories
INSERT INTO SupportRequestCategories (CategoryName, CategoryDescription, DefaultPriority) VALUES
('Academic Support', 'Help with coursework, tutoring, study skills', 'Medium'),
('Mental Health', 'Counseling, stress management, emotional support', 'High'),
('Financial Aid', 'Assistance with fees, bursaries, financial planning', 'Medium'),
('Career Guidance', 'Career counseling, job search, internship support', 'Low');

-- Insert Partners (Service Providers/Tutors)
INSERT INTO Partners (PartnerName, PartnerType, Specialization, ContactEmail, ContactPhone, MaxCapacity, Rating, YearsOfExperience, HourlyRate, Location, Bio) VALUES
('Dr. Sarah Johnson', 'Counselor', 'Mental Health, Stress Management', 'sarah.johnson@wellness.com', '+27-11-123-4567', 15, 4.8, 8, 750.00, 'Johannesburg', 'Experienced clinical psychologist specializing in student mental health and academic stress management.'),
('Prof. Michael Chen', 'Tutor', 'Computer Science, Mathematics', 'michael.chen@tutors.com', '+27-21-234-5678', 20, 4.9, 12, 500.00, 'Cape Town', 'Professor of Computer Science with extensive tutoring experience in programming and mathematics.'),
('Ms. Nomsa Mbeki', 'Mentor', 'Career Guidance, Professional Development', 'nomsa.mbeki@careers.com', '+27-31-345-6789', 12, 4.7, 5, 400.00, 'Durban', 'Career counselor with experience in helping students transition from university to workplace.'),
('Dr. James Wilson', 'Tutor', 'Engineering, Physics', 'james.wilson@engineering.com', '+27-11-456-7890', 18, 4.6, 10, 600.00, 'Johannesburg', 'Engineering professor offering tutoring in mechanical engineering and physics.'),
('Ms. Priya Patel', 'Counselor', 'Financial Planning, Student Aid', 'priya.patel@finance.com', '+27-21-567-8901', 10, 4.5, 6, 350.00, 'Cape Town', 'Financial advisor specializing in student financial planning and aid applications.'),
('Dr. Thabo Mthembu', 'Tutor', 'Medicine, Biology', 'thabo.mthembu@medical.com', '+27-31-678-9012', 15, 4.8, 9, 800.00, 'Durban', 'Medical doctor and researcher providing tutoring in medical sciences and biology.'),
('Ms. Lisa Rodriguez', 'Mentor', 'Study Skills, Academic Planning', 'lisa.rodriguez@academic.com', '+27-11-789-0123', 25, 4.4, 4, 300.00, 'Johannesburg', 'Academic success coach helping students develop effective study strategies and time management.'),
('Dr. Ahmed Hassan', 'Tutor', 'Business, Economics', 'ahmed.hassan@business.com', '+27-21-890-1234', 16, 4.7, 7, 450.00, 'Cape Town', 'Business professor with expertise in economics, finance, and business strategy.'),
('Ms. Jennifer Smith', 'Counselor', 'Peer Support, Group Therapy', 'jennifer.smith@support.com', '+27-31-901-2345', 20, 4.6, 5, 400.00, 'Durban', 'Licensed therapist specializing in group therapy and peer support programs for university students.');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Student Details with University and Program Information
CREATE VIEW vw_StudentDetails AS
SELECT
    s.StudentID,
    s.StudentName,
    s.StudentNumber,
    u.UniversityName,
    u.UniversityCode,
    p.ProgramName,
    p.ProgramCode,
    s.YearOfStudy,
    s.GPA,
    s.RiskLevel,
    s.ContactEmail,
    s.ContactPhone,
    s.DateEnrolled,
    s.LastLoginDate,
    s.IsActive,
    s.CreatedAt,
    s.UpdatedAt
FROM Students s
LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
LEFT JOIN Programs p ON s.ProgramID = p.ProgramID;

-- View: Support Request Details with Full Context
CREATE VIEW vw_SupportRequestDetails AS
SELECT
    sr.RequestID,
    sr.Title,
    sr.Description,
    sr.Priority,
    sr.Status,
    s.StudentName,
    s.StudentNumber,
    u.UniversityName,
    p.ProgramName,
    src.CategoryName,
    part.PartnerName,
    part.PartnerType,
    sr.CreatedAt,
    sr.UpdatedAt,
    sr.ResolvedAt,
    sr.Notes
FROM SupportRequests sr
LEFT JOIN Students s ON sr.StudentID = s.StudentID
LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
LEFT JOIN Programs p ON s.ProgramID = p.ProgramID
LEFT JOIN SupportRequestCategories src ON sr.CategoryID = src.CategoryID
LEFT JOIN Partners part ON sr.AssignedPartnerID = part.PartnerID;

-- View: Risk Level Statistics
CREATE VIEW vw_RiskStatistics AS
SELECT
    u.UniversityName,
    p.ProgramName,
    s.RiskLevel,
    COUNT(*) as StudentCount,
    AVG(s.GPA) as AverageGPA
FROM Students s
LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
LEFT JOIN Programs p ON s.ProgramID = p.ProgramID
WHERE s.IsActive = 1
GROUP BY u.UniversityName, p.ProgramName, s.RiskLevel;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Stored Procedure: Get Students by Risk Level
CREATE PROCEDURE sp_GetStudentsByRiskLevel
    @RiskLevel NVARCHAR(20)
AS
BEGIN
    SELECT
        s.StudentID,
        s.StudentName,
        s.StudentNumber,
        u.UniversityName,
        p.ProgramName,
        s.YearOfStudy,
        s.GPA,
        s.RiskLevel,
        s.ContactEmail
    FROM Students s
    LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
    LEFT JOIN Programs p ON s.ProgramID = p.ProgramID
    WHERE s.RiskLevel = @RiskLevel AND s.IsActive = 1
    ORDER BY s.GPA ASC, s.StudentName;
END;

-- Stored Procedure: Partner Workload Analysis
CREATE PROCEDURE sp_GetPartnerWorkload
AS
BEGIN
    SELECT
        p.PartnerID,
        p.PartnerName,
        p.PartnerType,
        p.MaxCapacity,
        p.CurrentWorkload,
        (p.MaxCapacity - p.CurrentWorkload) as AvailableCapacity,
        CAST((CAST(p.CurrentWorkload AS FLOAT) / p.MaxCapacity * 100) AS DECIMAL(5,2)) as UtilizationRate,
        COUNT(sr.RequestID) as ActiveRequests,
        p.Rating,
        p.IsAvailable
    FROM Partners p
    LEFT JOIN SupportRequests sr ON p.PartnerID = sr.AssignedPartnerID
        AND sr.Status IN ('Open', 'In Progress')
    GROUP BY p.PartnerID, p.PartnerName, p.PartnerType, p.MaxCapacity,
             p.CurrentWorkload, p.Rating, p.IsAvailable
    ORDER BY UtilizationRate DESC;
END;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Students table indexes
CREATE INDEX IX_Students_UniversityID ON Students(UniversityID);
CREATE INDEX IX_Students_ProgramID ON Students(ProgramID);
CREATE INDEX IX_Students_RiskLevel ON Students(RiskLevel);
CREATE INDEX IX_Students_IsActive ON Students(IsActive);
CREATE INDEX IX_Students_GPA ON Students(GPA);

-- Support Requests indexes
CREATE INDEX IX_SupportRequests_StudentID ON SupportRequests(StudentID);
CREATE INDEX IX_SupportRequests_CategoryID ON SupportRequests(CategoryID);
CREATE INDEX IX_SupportRequests_AssignedPartnerID ON SupportRequests(AssignedPartnerID);
CREATE INDEX IX_SupportRequests_Status ON SupportRequests(Status);
CREATE INDEX IX_SupportRequests_Priority ON SupportRequests(Priority);
CREATE INDEX IX_SupportRequests_CreatedAt ON SupportRequests(CreatedAt);

-- Partners table indexes
CREATE INDEX IX_Partners_PartnerType ON Partners(PartnerType);
CREATE INDEX IX_Partners_IsAvailable ON Partners(IsAvailable);
CREATE INDEX IX_Partners_Rating ON Partners(Rating);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger to update Partners.CurrentWorkload when support requests are assigned/unassigned
CREATE TRIGGER tr_UpdatePartnerWorkload
ON SupportRequests
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Update workload for partners affected by changes
    UPDATE Partners
    SET CurrentWorkload = (
        SELECT COUNT(*)
        FROM SupportRequests sr
        WHERE sr.AssignedPartnerID = Partners.PartnerID
          AND sr.Status IN ('Open', 'In Progress')
    )
    WHERE PartnerID IN (
        SELECT DISTINCT AssignedPartnerID
        FROM inserted
        WHERE AssignedPartnerID IS NOT NULL
        UNION
        SELECT DISTINCT AssignedPartnerID
        FROM deleted
        WHERE AssignedPartnerID IS NOT NULL
    );
END;

-- Trigger to update UpdatedAt timestamp
CREATE TRIGGER tr_UpdateStudentsTimestamp
ON Students
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Students
    SET UpdatedAt = GETDATE()
    WHERE StudentID IN (SELECT DISTINCT StudentID FROM inserted);
END;

-- ============================================================================
-- SAMPLE SUPPORT REQUESTS DATA
-- ============================================================================

-- Note: Student data will be inserted separately in the remaining_students_data.sql file
-- For now, we'll create a few sample support requests that will be populated after students are added

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function to calculate student risk score based on GPA and other factors
CREATE FUNCTION fn_CalculateRiskScore(@StudentID INT)
RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @RiskScore DECIMAL(5,2) = 0.0;
    DECLARE @GPA DECIMAL(3,2);
    DECLARE @SupportRequestCount INT;

    SELECT @GPA = GPA FROM Students WHERE StudentID = @StudentID;

    SELECT @SupportRequestCount = COUNT(*)
    FROM SupportRequests
    WHERE StudentID = @StudentID AND Status IN ('Open', 'In Progress');

    -- Calculate risk score based on GPA (lower GPA = higher risk)
    IF @GPA < 2.0
        SET @RiskScore = @RiskScore + 50.0;
    ELSE IF @GPA < 2.5
        SET @RiskScore = @RiskScore + 30.0;
    ELSE IF @GPA < 3.0
        SET @RiskScore = @RiskScore + 15.0;

    -- Add risk based on active support requests
    SET @RiskScore = @RiskScore + (@SupportRequestCount * 10.0);

    RETURN @RiskScore;
END;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

PRINT '============================================================================';
PRINT 'SUCCESS: Student Wellness Dashboard Database Schema Created Successfully!';
PRINT '';
PRINT 'Database: StudentWellnessDB';
PRINT 'Tables Created: 8';
PRINT 'Views Created: 3';
PRINT 'Stored Procedures: 2';
PRINT 'Functions: 1';
PRINT 'Triggers: 2';
PRINT 'Universities: 4';
PRINT 'Programs: 6';
PRINT 'Partners: 9';
PRINT 'Support Categories: 4';
PRINT '';
PRINT 'Next Steps:';
PRINT '1. Run remaining_students_data.sql to populate student data';
PRINT '2. Verify data integrity with sample queries';
PRINT '3. Set up API connection using provided backend files';
PRINT '============================================================================';

-- Sample verification queries
/*
-- Verify table creation
SELECT
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_CATALOG = 'StudentWellnessDB'
ORDER BY TABLE_NAME;

-- Check initial data
SELECT 'Universities' as Entity, COUNT(*) as Count FROM Universities
UNION ALL
SELECT 'Programs' as Entity, COUNT(*) as Count FROM Programs
UNION ALL
SELECT 'Partners' as Entity, COUNT(*) as Count FROM Partners
UNION ALL
SELECT 'Support Categories' as Entity, COUNT(*) as Count FROM SupportRequestCategories;
*/
-- Create Tables for SQLite (Cloudflare D1)

-- Existing tables...
CREATE TABLE IF NOT EXISTS Universities (
    UniversityID INTEGER PRIMARY KEY AUTOINCREMENT,
    UniversityName TEXT NOT NULL UNIQUE,
    UniversityCode TEXT NOT NULL UNIQUE,
    Location TEXT,
    Website TEXT,
    ContactEmail TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS Programs (
    ProgramID INTEGER PRIMARY KEY AUTOINCREMENT,
    ProgramName TEXT NOT NULL,
    ProgramCode TEXT NOT NULL,
    Department TEXT,
    DurationYears INTEGER NOT NULL DEFAULT 3,
    IsActive INTEGER NOT NULL DEFAULT 1,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS Partners (
    PartnerID INTEGER PRIMARY KEY AUTOINCREMENT,
    PartnerName TEXT NOT NULL,
    PartnerType TEXT NOT NULL,
    Specialization TEXT,
    ContactEmail TEXT NOT NULL,
    ContactPhone TEXT,
    IsAvailable INTEGER NOT NULL DEFAULT 1,
    MaxCapacity INTEGER NOT NULL DEFAULT 10,
    CurrentWorkload INTEGER NOT NULL DEFAULT 0,
    Rating REAL DEFAULT 0.00,
    YearsOfExperience INTEGER DEFAULT 0,
    HourlyRate REAL,
    Location TEXT,
    Bio TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS SupportRequestCategories (
    CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    CategoryName TEXT NOT NULL UNIQUE,
    CategoryDescription TEXT,
    DefaultPriority TEXT DEFAULT 'Medium',
    IsActive INTEGER NOT NULL DEFAULT 1,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS Students (
    StudentID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentName TEXT NOT NULL,
    StudentNumber TEXT NOT NULL UNIQUE,
    UniversityID INTEGER NOT NULL,
    ProgramID INTEGER NOT NULL,
    YearOfStudy INTEGER NOT NULL,
    GPA REAL,
    RiskLevel TEXT NOT NULL DEFAULT 'Safe',
    ContactEmail TEXT NOT NULL,
    ContactPhone TEXT,
    EmergencyContact TEXT,
    EmergencyPhone TEXT,
    DateEnrolled TEXT NOT NULL,
    LastLoginDate TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (UniversityID) REFERENCES Universities(UniversityID),
    FOREIGN KEY (ProgramID) REFERENCES Programs(ProgramID)
);

CREATE TABLE IF NOT EXISTS SupportRequests (
    RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    CategoryID INTEGER NOT NULL,
    Title TEXT NOT NULL,
    Description TEXT NOT NULL,
    Priority TEXT NOT NULL DEFAULT 'Medium',
    Status TEXT NOT NULL DEFAULT 'Open',
    AssignedPartnerID INTEGER NULL,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    ResolvedAt TEXT NULL,
    Notes TEXT,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (CategoryID) REFERENCES SupportRequestCategories(CategoryID),
    FOREIGN KEY (AssignedPartnerID) REFERENCES Partners(PartnerID)
);

CREATE TABLE IF NOT EXISTS SupportLogs (
    LogID INTEGER PRIMARY KEY AUTOINCREMENT,
    RequestID INTEGER NOT NULL,
    PartnerID INTEGER NOT NULL,
    SessionDate TEXT NOT NULL,
    Duration INTEGER,
    SessionType TEXT,
    Notes TEXT,
    Outcome TEXT,
    FollowUpRequired INTEGER DEFAULT 0,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (RequestID) REFERENCES SupportRequests(RequestID),
    FOREIGN KEY (PartnerID) REFERENCES Partners(PartnerID)
);

CREATE TABLE IF NOT EXISTS StudentProfiles (
    ProfileID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    ProfilePictureURL TEXT,
    Bio TEXT,
    Interests TEXT,
    Goals TEXT,
    Achievements TEXT,
    PreferredContactMethod TEXT DEFAULT 'Email',
    IsPublic INTEGER DEFAULT 0,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
);

-- Coordinators table (needed before Users table for FK)
CREATE TABLE IF NOT EXISTS Coordinators (
    CoordinatorID INTEGER PRIMARY KEY AUTOINCREMENT,
    CoordinatorName TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Department TEXT,
    UniversityID INTEGER,
    IsActive INTEGER DEFAULT 1,
    CreatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (UniversityID) REFERENCES Universities(UniversityID)
);

-- NEW: Users table for authentication
CREATE TABLE IF NOT EXISTS Users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    UserType TEXT NOT NULL CHECK (UserType IN ('Student', 'Coordinator', 'Partner', 'Admin')),
    FirstName TEXT,
    LastName TEXT,
    StudentID INTEGER NULL,
    CoordinatorID INTEGER NULL,
    PartnerID INTEGER NULL,
    IsActive INTEGER NOT NULL DEFAULT 1,
    IsEmailVerified INTEGER DEFAULT 0,
    LastLoginDate TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (CoordinatorID) REFERENCES Coordinators(CoordinatorID), -- Add Coordinators table if needed
    FOREIGN KEY (PartnerID) REFERENCES Partners(PartnerID),
    UNIQUE(Email, UserType)
);

-- Minimal sample for testing (remove in full prod)
INSERT OR IGNORE INTO Universities (UniversityName, UniversityCode, Location) VALUES
('University of Cape Town', 'UCT', 'Cape Town'),
('University of Johannesburg', 'UJ', 'Johannesburg');

INSERT OR IGNORE INTO Programs (ProgramName, ProgramCode, Department) VALUES
('Computer Science', 'CS', 'Science'),
('Business Administration', 'BA', 'Business');

INSERT OR IGNORE INTO Students (StudentName, StudentNumber, UniversityID, ProgramID, ContactEmail, DateEnrolled) VALUES
('John Doe', 'UCT2024001', 1, 1, 'john.doe@uct.ac.za', CURRENT_TIMESTAMP),
('Jane Smith', 'UJ2024002', 2, 2, 'jane.smith@uj.ac.za', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO Users (Email, PasswordHash, UserType, StudentID, FirstName, LastName) VALUES
('john.doe@uct.ac.za', '$2a$12$examplehashforjohn', 'Student', 1, 'John', 'Doe'),
('admin@wellness.com', '$2a$12$examplehashforadmin', 'Admin', NULL, 'Admin', 'User'),
('coord@uj.ac.za', '$2a$12$examplehashforcoord', 'Coordinator', NULL, 'Jane', 'Coordinator');

-- Views for queries
CREATE VIEW IF NOT EXISTS vw_StudentDetails AS
SELECT s.*, u.UniversityName, p.ProgramName
FROM Students s
JOIN Universities u ON s.UniversityID = u.UniversityID
JOIN Programs p ON s.ProgramID = p.ProgramID;

-- Sample data (remove in production)
INSERT OR IGNORE INTO Coordinators (CoordinatorName, Email, UniversityID) VALUES
('University Coordinator', 'coord@uj.ac.za', 2);


-- ============================================================================
-- MASTER ONBOARDING SCRIPT FOR CLOUDFLARE D1 (SQLITE) - V2
-- Includes: All features, Coordinators, Students, Users, and Messages
-- ============================================================================

-- 1. DROP EXISTING TABLES (Clean Slate)
DROP TABLE IF EXISTS Reminders;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS AcademicMarks;
DROP TABLE IF EXISTS InterventionCommunications;
DROP TABLE IF EXISTS Interventions;
DROP TABLE IF EXISTS SupportLogs;
DROP TABLE IF EXISTS SupportRequests;
DROP TABLE IF EXISTS StudentProfiles;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Students;
DROP TABLE IF EXISTS Coordinators;
DROP TABLE IF EXISTS Partners;
DROP TABLE IF EXISTS SupportRequestCategories;
DROP TABLE IF EXISTS Programs;
DROP TABLE IF EXISTS Universities;

-- 2. CREATE CORE MASTER TABLES
CREATE TABLE Universities (
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

CREATE TABLE Programs (
    ProgramID INTEGER PRIMARY KEY AUTOINCREMENT,
    ProgramName TEXT NOT NULL,
    ProgramCode TEXT NOT NULL,
    Department TEXT,
    DurationYears INTEGER NOT NULL DEFAULT 3,
    IsActive INTEGER NOT NULL DEFAULT 1,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE SupportRequestCategories (
    CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    CategoryName TEXT NOT NULL UNIQUE,
    CategoryDescription TEXT,
    DefaultPriority TEXT DEFAULT 'Medium',
    IsActive INTEGER NOT NULL DEFAULT 1,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 3. CREATE STAKEHOLDER TABLES
CREATE TABLE Coordinators (
    CoordinatorID INTEGER PRIMARY KEY AUTOINCREMENT,
    CoordinatorName TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Avatar TEXT,
    Department TEXT,
    Phone TEXT,
    Role TEXT DEFAULT 'Social Worker / Coordinator',
    IsActive INTEGER NOT NULL DEFAULT 1,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE Partners (
    PartnerID INTEGER PRIMARY KEY AUTOINCREMENT,
    PartnerName TEXT NOT NULL,
    PartnerType TEXT NOT NULL, -- 'Individual' | 'Organization'
    Role TEXT, -- 'Academic Tutor' | 'Wellness Provider' etc.
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

CREATE TABLE Students (
    StudentID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentName TEXT NOT NULL,
    StudentNumber TEXT NOT NULL UNIQUE,
    Email TEXT NOT NULL UNIQUE,
    Avatar TEXT,
    UniversityID INTEGER NOT NULL,
    ProgramID INTEGER NOT NULL,
    YearOfStudy INTEGER NOT NULL,
    GPA REAL,
    RiskLevel TEXT NOT NULL DEFAULT 'Safe', -- 'Safe' | 'At Risk' | 'Critical'
    Phone TEXT,
    AssignedCoordinatorID INTEGER,
    IsActive INTEGER NOT NULL DEFAULT 1,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (UniversityID) REFERENCES Universities(UniversityID),
    FOREIGN KEY (ProgramID) REFERENCES Programs(ProgramID),
    FOREIGN KEY (AssignedCoordinatorID) REFERENCES Coordinators(CoordinatorID)
);

-- 4. CREATE SYSTEM TABLES (AUTH & PROFILE)
CREATE TABLE Users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    UserType TEXT NOT NULL, -- 'Student', 'Coordinator', 'Partner', 'Admin'
    FirstName TEXT,
    LastName TEXT,
    ProfilePictureURL TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1,
    IsEmailVerified INTEGER DEFAULT 0,
    LastLoginDate TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    StudentID INTEGER,
    CoordinatorID INTEGER,
    PartnerID INTEGER,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (CoordinatorID) REFERENCES Coordinators(CoordinatorID),
    FOREIGN KEY (PartnerID) REFERENCES Partners(PartnerID)
);

CREATE TABLE StudentProfiles (
    ProfileID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    ProfilePictureURL TEXT,
    Bio TEXT,
    Interests TEXT,
    Goals TEXT,
    Achievements TEXT,
    PreferredContactMethod TEXT DEFAULT 'Email',
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
);

-- 5. CREATE FEATURE TABLES (REQUESTS, LOGS, INTERVENTIONS, MESSAGES)
CREATE TABLE SupportRequests (
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

CREATE TABLE SupportLogs (
    LogID INTEGER PRIMARY KEY AUTOINCREMENT,
    RequestID INTEGER NOT NULL,
    PartnerID INTEGER NOT NULL,
    SessionDate TEXT NOT NULL,
    Duration INTEGER,
    SessionType TEXT,
    Notes TEXT,
    Outcome TEXT, -- 'Improved' | 'Same' | 'Declined'
    Cost REAL,
    Status TEXT DEFAULT 'Pending', -- 'Pending' | 'Submitted' | 'Paid' | 'Rejected'
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (RequestID) REFERENCES SupportRequests(RequestID),
    FOREIGN KEY (PartnerID) REFERENCES Partners(PartnerID)
);

CREATE TABLE Interventions (
    InterventionID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    CoordinatorID INTEGER NOT NULL,
    Type TEXT NOT NULL, -- "Academic Check-in", "Tutor Referral" etc.
    Status TEXT NOT NULL DEFAULT 'Open',
    Priority TEXT DEFAULT 'Medium',
    Description TEXT,
    Notes TEXT,
    FollowUpDate TEXT,
    Origin TEXT DEFAULT 'Coordinator', -- 'Student' | 'Coordinator'
    IsStudentRequest INTEGER DEFAULT 0,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (CoordinatorID) REFERENCES Coordinators(CoordinatorID)
);

CREATE TABLE InterventionCommunications (
    CommunicationID INTEGER PRIMARY KEY AUTOINCREMENT,
    InterventionID INTEGER NOT NULL,
    SenderRole TEXT NOT NULL, -- 'student' | 'coordinator'
    SenderName TEXT NOT NULL,
    Message TEXT NOT NULL,
    IsRead INTEGER DEFAULT 0,
    Timestamp TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (InterventionID) REFERENCES Interventions(InterventionID)
);

CREATE TABLE AcademicMarks (
    MarkID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    CourseName TEXT NOT NULL,
    Type TEXT NOT NULL, -- 'Test' | 'Assignment' etc.
    Percentage REAL NOT NULL,
    Weight REAL,
    Semester TEXT,
    Notes TEXT,
    Timestamp TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
);

CREATE TABLE Notifications (
    NotificationID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    Title TEXT NOT NULL,
    Message TEXT NOT NULL,
    Type TEXT NOT NULL, -- 'request' | 'message' | 'system'
    IsRead INTEGER DEFAULT 0,
    Link TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Messages (
    MessageID INTEGER PRIMARY KEY AUTOINCREMENT,
    SenderType TEXT NOT NULL, -- 'student' | 'coordinator' | 'partner'
    SenderID INTEGER NOT NULL, -- ProfileID matching the type
    RecipientType TEXT NOT NULL,
    RecipientID INTEGER NOT NULL,
    Content TEXT,
    AttachmentURL TEXT,
    FileName TEXT,
    FileType TEXT,
    FileSize INTEGER,
    IsRead INTEGER DEFAULT 0,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE Reminders (
    ReminderID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    Content TEXT NOT NULL,
    DueDate TEXT,
    IsCompleted INTEGER DEFAULT 0,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- ============================================================================
-- DATA ONBOARDING
-- ============================================================================

-- 1. Master Data
INSERT INTO Universities (UniversityName, UniversityCode, Location) VALUES
('University of Cape Town', 'UCT', 'Cape Town'),
('University of Johannesburg', 'UJ', 'Johannesburg'),
('Wits University', 'Wits', 'Johannesburg'),
('Stellenbosch University', 'SUN', 'Stellenbosch');

INSERT INTO Programs (ProgramName, ProgramCode, Department, DurationYears) VALUES
('Bachelor of Laws', 'LLB', 'Law', 4),
('Bachelor of Commerce', 'BCom', 'Commerce', 3),
('Bachelor of Science in CS', 'BSc CS', 'Science', 3),
('Bachelor of Arts', 'BA', 'Humanities', 3);

INSERT INTO SupportRequestCategories (CategoryName, CategoryDescription, DefaultPriority) VALUES
('Academic Support Request', 'Tutoring and coursework help', 'Medium'),
('Wellness Support Request', 'Mental health and emotional well-being', 'High'),
('Financial Aid Request', 'Assistance with funding and fees', 'Medium'),
('Technical Support Request', 'Help with IT and devices', 'Low');

-- 2. Onboard Coordinators (Requested)
INSERT INTO Coordinators (CoordinatorName, Email, Role, Department) VALUES
('Giovanni Nanuseb', 'giovanni@geniusup.tech', 'Lead Coordinator', 'Student Affairs'),
('Blessing Mlambo', 'blessing@geniusup.tech', 'Senior Coordinator', 'Academic Support'),
('Mfundo', 'mfundo@geniusup.tech', 'Coordinator', 'Wellness Department');

-- 3. Onboard 15 Students (5 assigned to each coordinator)

-- Giovanni's 5 Students
INSERT INTO Students (StudentName, StudentNumber, Email, UniversityID, ProgramID, YearOfStudy, GPA, RiskLevel, AssignedCoordinatorID) VALUES
('John Smith', 'ST2026001', 'john.smith@gmail.com', 1, 1, 1, 3.2, 'Safe', 1),
('Emily Brown', 'ST2026002', 'emily.brown@gmail.com', 1, 2, 2, 2.8, 'Safe', 1),
('Michael Johnson', 'ST2026003', 'michael.j@gmail.com', 2, 3, 3, 1.5, 'Critical', 1),
('Sarah Williams', 'ST2026004', 'sarah.w@gmail.com', 2, 4, 1, 3.8, 'Safe', 1),
('David Lee', 'ST2026005', 'david.lee@gmail.com', 3, 1, 2, 2.1, 'At Risk', 1);

-- Blessing's 5 Students
INSERT INTO Students (StudentName, StudentNumber, Email, UniversityID, ProgramID, YearOfStudy, GPA, RiskLevel, AssignedCoordinatorID) VALUES
('Lerato Khumalo', 'ST2026006', 'lerato.k@gmail.com', 3, 2, 3, 3.5, 'Safe', 2),
('Thabo Mokoena', 'ST2026007', 'thabo.m@gmail.com', 4, 3, 1, 2.4, 'At Risk', 2),
('Jessica Naidoo', 'ST2026008', 'jessica.n@gmail.com', 4, 4, 2, 3.9, 'Safe', 2),
('Zanele Ndlovu', 'ST2026009', 'zanele.n@gmail.com', 1, 1, 3, 1.2, 'Critical', 2),
('Kevin White', 'ST2026010', 'kevin.w@gmail.com', 1, 2, 1, 2.9, 'Safe', 2);

-- Mfundo's 5 Students
INSERT INTO Students (StudentName, StudentNumber, Email, UniversityID, ProgramID, YearOfStudy, GPA, RiskLevel, AssignedCoordinatorID) VALUES
('Peter Parker', 'ST2026011', 'spiderman@gmail.com', 2, 3, 2, 3.1, 'Safe', 3),
('Mary Jane', 'ST2026012', 'mj@gmail.com', 2, 4, 2, 3.3, 'Safe', 3),
('Bruce Wayne', 'ST2026013', 'batman@gmail.com', 3, 1, 3, 4.0, 'Safe', 3),
('Clark Kent', 'ST2026014', 'superman@gmail.com', 3, 2, 1, 2.5, 'At Risk', 3),
('Diana Prince', 'ST2026015', 'wonderwoman@gmail.com', 4, 3, 1, 3.7, 'Safe', 3);

-- 4. Create User Accounts for them (Password is 'Password123!')
-- Giovanni, Blessing, Mfundo (Coordinators)
INSERT INTO Users (Email, PasswordHash, UserType, FirstName, LastName, CoordinatorID) VALUES
('giovanni@geniusup.tech', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Coordinator', 'Giovanni', 'Nanuseb', 1),
('blessing@geniusup.tech', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Coordinator', 'Blessing', 'Mlambo', 2),
('mfundo@geniusup.tech', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Coordinator', 'Mfundo', 'User', 3);

-- Students (All 15)
INSERT INTO Users (Email, PasswordHash, UserType, FirstName, LastName, StudentID) VALUES
('john.smith@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'John', 'Smith', 1),
('emily.brown@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Emily', 'Brown', 2),
('michael.j@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Michael', 'Johnson', 3),
('sarah.w@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Sarah', 'Williams', 4),
('david.lee@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'David', 'Lee', 5),
('lerato.k@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Lerato', 'Khumalo', 6),
('thabo.m@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Thabo', 'Mokoena', 7),
('jessica.n@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Jessica', 'Naidoo', 8),
('zanele.n@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Zanele', 'Ndlovu', 9),
('kevin.w@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Kevin', 'White', 10),
('spiderman@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Peter', 'Parker', 11),
('mj@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Mary', 'Jane', 12),
('batman@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Bruce', 'Wayne', 13),
('superman@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Clark', 'Kent', 14),
('wonderwoman@gmail.com', '$2a$10$4sM/3OWEEPZEBnOblAGSyuk3ZK8gxMyHynjt8fwfgwDLGaxyNPu6.', 'Student', 'Diana', 'Prince', 15);

-- 5. Insert Partners
INSERT INTO Partners (PartnerName, PartnerType, Role, Specialization, ContactEmail, MaxCapacity, Rating, YearsOfExperience) VALUES
('Academic Success Tutoring', 'Organization', 'Tutoring Agency', 'Mathematics, Physics', 'contact@academicsuccess.com', 100, 4.9, 10),
('Inner Peace Wellness', 'Organization', 'Wellness Center', 'Counseling, Meditation', 'info@innerpeace.com', 50, 4.8, 8),
('John Doe', 'Individual', 'Academic Tutor', 'Law, Humanities', 'johndoe@gmail.com', 10, 4.7, 5);

-- 6. Sample Connectivity Data (Support Requests for Onboarded Students)
INSERT INTO SupportRequests (StudentID, CategoryID, Title, Description, Priority, Status, AssignedPartnerID) VALUES
(1, 1, 'Math Tutoring Needed', 'Struggling with Calculus 1 formulas.', 'Medium', 'In Progress', 1),
(6, 2, 'Counseling Request', 'Feeling overwhelmed with exams.', 'High', 'Open', 2),
(11, 3, 'Bursary Questions', 'Need help with NSFAS application.', 'Medium', 'Open', NULL);

-- 7. Sample Intervention
INSERT INTO Interventions (StudentID, CoordinatorID, Type, Status, Priority, Description) VALUES
(3, 1, 'Academic Check-in', 'Open', 'Critical', 'Michael is failing 3 subjects. Immediate intervention required.');

INSERT INTO InterventionCommunications (InterventionID, SenderRole, SenderName, Message) VALUES
(1, 'coordinator', 'Giovanni Nanuseb', 'Hi Michael, I noticed your GPA dropped significantly. Can we meet?'),
(1, 'student', 'Michael Johnson', 'Hi Giovanni, yes please. I am really struggling with the workload.');

-- 8. Sample Messages
INSERT INTO Messages (SenderType, SenderID, RecipientType, RecipientID, Content) VALUES
('coordinator', 1, 'student', 1, 'Hello John, welcome to the platform!'),
('student', 1, 'coordinator', 1, 'Thank you Giovanni, glad to be here.'),
('coordinator', 2, 'student', 6, 'Hi Lerato, I saw your counseling request. We are assigning a partner now.');

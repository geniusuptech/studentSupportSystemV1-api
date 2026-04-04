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

-- Messages table for coordinator-student-partner communications
CREATE TABLE IF NOT EXISTS Messages (
    MessageID INTEGER PRIMARY KEY AUTOINCREMENT,
    SenderType TEXT NOT NULL CHECK (SenderType IN ('student', 'coordinator', 'partner')),
    SenderID INTEGER NOT NULL,
    RecipientType TEXT NOT NULL CHECK (RecipientType IN ('student', 'coordinator', 'partner')),
    RecipientID INTEGER NOT NULL,
    Content TEXT NOT NULL,
    IsRead INTEGER NOT NULL DEFAULT 0,
    AttachmentURL TEXT,
    FileName TEXT,
    FileType TEXT,
    FileSize INTEGER,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Interventions table for tracking student interventions
CREATE TABLE IF NOT EXISTS Interventions (
    InterventionID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    CoordinatorID INTEGER,
    Type TEXT NOT NULL,
    Notes TEXT,
    Status TEXT NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active', 'Completed', 'Cancelled', 'Pending')),
    Priority TEXT NOT NULL DEFAULT 'Medium' CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical')),
    FollowUpDate TEXT,
    CompletedAt TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (CoordinatorID) REFERENCES Coordinators(CoordinatorID)
);

-- Activity Logs table for tracking all system activities
CREATE TABLE IF NOT EXISTS ActivityLogs (
    LogID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserType TEXT NOT NULL,
    UserID INTEGER NOT NULL,
    Action TEXT NOT NULL,
    EntityType TEXT,
    EntityID INTEGER,
    Details TEXT,
    IPAddress TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS Notifications (
    NotificationID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserType TEXT NOT NULL,
    UserID INTEGER NOT NULL,
    Title TEXT NOT NULL,
    Message TEXT NOT NULL,
    Type TEXT NOT NULL DEFAULT 'info' CHECK (Type IN ('info', 'warning', 'error', 'success')),
    IsRead INTEGER NOT NULL DEFAULT 0,
    Link TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Student Courses table
CREATE TABLE IF NOT EXISTS StudentCourses (
    CourseID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    CourseName TEXT NOT NULL,
    CourseCode TEXT NOT NULL,
    Instructor TEXT,
    Credits INTEGER DEFAULT 0,
    Grade TEXT,
    GradePoints REAL,
    Semester TEXT,
    Year INTEGER,
    Status TEXT DEFAULT 'In Progress' CHECK (Status IN ('In Progress', 'Completed', 'Withdrawn', 'Failed')),
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
);

-- Student Assignments table
CREATE TABLE IF NOT EXISTS StudentAssignments (
    AssignmentID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    CourseID INTEGER,
    Title TEXT NOT NULL,
    Description TEXT,
    DueDate TEXT,
    SubmittedDate TEXT,
    Grade REAL,
    MaxGrade REAL DEFAULT 100,
    Status TEXT DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Submitted', 'Graded', 'Late', 'Missing')),
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (CourseID) REFERENCES StudentCourses(CourseID)
);

-- Student Metrics table for tracking wellness and academic metrics over time
CREATE TABLE IF NOT EXISTS StudentMetrics (
    MetricID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    AttendanceRate REAL DEFAULT 0,
    AssignmentCompletion REAL DEFAULT 0,
    AverageGrade REAL DEFAULT 0,
    WellnessScore REAL DEFAULT 0,
    SupportRequestsCount INTEGER DEFAULT 0,
    RecordedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
);

-- Student Schedule table
CREATE TABLE IF NOT EXISTS StudentSchedule (
    ScheduleID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    CourseID INTEGER,
    Title TEXT NOT NULL,
    Description TEXT,
    DayOfWeek TEXT NOT NULL CHECK (DayOfWeek IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    StartTime TEXT NOT NULL,
    EndTime TEXT NOT NULL,
    Location TEXT,
    Instructor TEXT,
    Type TEXT DEFAULT 'Lecture' CHECK (Type IN ('Lecture','Tutorial','Lab','Exam','Other')),
    IsRecurring INTEGER DEFAULT 1,
    EventDate TEXT,
    Semester TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (CourseID) REFERENCES StudentCourses(CourseID)
);

-- Student Settings / Preferences table
CREATE TABLE IF NOT EXISTS StudentSettings (
    SettingID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL UNIQUE,
    Theme TEXT DEFAULT 'light' CHECK (Theme IN ('light','dark','system')),
    Language TEXT DEFAULT 'en',
    EmailNotifications INTEGER DEFAULT 1,
    PushNotifications INTEGER DEFAULT 1,
    SMSNotifications INTEGER DEFAULT 0,
    ShowProfilePublic INTEGER DEFAULT 0,
    ShowGPA INTEGER DEFAULT 0,
    ShowCourses INTEGER DEFAULT 0,
    TwoFactorEnabled INTEGER DEFAULT 0,
    PreferredContactMethod TEXT DEFAULT 'Email',
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
);

-- Student Wellness Check-ins table (for tracking wellness over time)
CREATE TABLE IF NOT EXISTS StudentWellnessCheckins (
    CheckinID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    MoodScore INTEGER CHECK (MoodScore BETWEEN 1 AND 10),
    StressLevel INTEGER CHECK (StressLevel BETWEEN 1 AND 10),
    SleepHours REAL,
    ExerciseMinutes INTEGER DEFAULT 0,
    Notes TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
);

-- Views for queries
CREATE VIEW IF NOT EXISTS vw_StudentDetails AS
SELECT s.*, u.UniversityName, p.ProgramName
FROM Students s
JOIN Universities u ON s.UniversityID = u.UniversityID
JOIN Programs p ON s.ProgramID = p.ProgramID;


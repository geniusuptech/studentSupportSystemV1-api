-- Create Tables for SQLite (Cloudflare D1)

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

CREATE TABLE Partners (
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

CREATE TABLE SupportRequestCategories (
    CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    CategoryName TEXT NOT NULL UNIQUE,
    CategoryDescription TEXT,
    DefaultPriority TEXT DEFAULT 'Medium',
    IsActive INTEGER NOT NULL DEFAULT 1,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE Students (
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
    Outcome TEXT,
    FollowUpRequired INTEGER DEFAULT 0,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (RequestID) REFERENCES SupportRequests(RequestID),
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
    IsPublic INTEGER DEFAULT 0,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    UpdatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
);

-- Initial Data
INSERT INTO Universities (UniversityName, UniversityCode, Location, Website, ContactEmail) VALUES
('University of Cape Town', 'UCT', 'Cape Town, Western Cape', 'https://www.uct.ac.za', 'info@uct.ac.za'),
('University of the Witwatersrand', 'WITS', 'Johannesburg, Gauteng', 'https://www.wits.ac.za', 'info@wits.ac.za'),
('University of Johannesburg', 'UJ', 'Johannesburg, Gauteng', 'https://www.uj.ac.za', 'info@uj.ac.za'),
('University of KwaZulu-Natal', 'UKZN', 'Durban, KwaZulu-Natal', 'https://www.ukzn.ac.za', 'info@ukzn.ac.za');

INSERT INTO Programs (ProgramName, ProgramCode, Department, DurationYears) VALUES
('Computer Science', 'CS', 'Computer Science', 3),
('Business Administration', 'BA', 'Business School', 3),
('Engineering', 'ENG', 'Engineering', 4),
('Medicine', 'MED', 'Health Sciences', 6),
('Psychology', 'PSY', 'Psychology', 3),
('Law', 'LAW', 'Law School', 4);

INSERT INTO SupportRequestCategories (CategoryName, CategoryDescription, DefaultPriority) VALUES
('Academic Support', 'Help with coursework, tutoring, study skills', 'Medium'),
('Mental Health', 'Counseling, stress management, emotional support', 'High'),
('Financial Aid', 'Assistance with fees, bursaries, financial planning', 'Medium'),
('Career Guidance', 'Career counseling, job search, internship support', 'Low');

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

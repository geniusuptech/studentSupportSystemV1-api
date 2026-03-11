-- ============================================================================
-- Partners Table Creation and Sample Data Script
-- ============================================================================
-- This script creates the Partners table and populates it with sample data
-- for tutors, counselors, advisors, and other support partners in the
-- Student Wellness Dashboard system.
-- ============================================================================

USE StudentWellness;
GO

-- ============================================================================
-- 1. CREATE PARTNERS TABLE
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Partners]') AND type in (N'U'))
BEGIN
    CREATE TABLE Partners (
        PartnerID           INT PRIMARY KEY IDENTITY(1,1),
        PartnerName         NVARCHAR(255) NOT NULL,
        PartnerType         NVARCHAR(50) NOT NULL,           -- Tutor, Counselor, Advisor, etc.
        Specialization      NVARCHAR(255),                   -- Subject/area of expertise
        UniversityID        INT FOREIGN KEY REFERENCES Universities(UniversityID),
        ContactEmail        NVARCHAR(255) NOT NULL,
        ContactPhone        NVARCHAR(20),
        OfficeLocation      NVARCHAR(255),
        AvailableHours      NVARCHAR(255),                  -- e.g., "Mon-Fri 9AM-5PM"
        MaxStudents         INT DEFAULT 20,                  -- Maximum concurrent students
        CurrentStudents     INT DEFAULT 0,                   -- Current active assignments
        HourlyRate          DECIMAL(8,2),                    -- For paid tutors
        Rating              DECIMAL(3,2) DEFAULT 0.00,       -- Average rating 0-5
        TotalReviews        INT DEFAULT 0,
        Qualifications      NVARCHAR(MAX),                   -- Education/certifications
        Bio                 NVARCHAR(MAX),                   -- Partner biography
        ProfilePictureURL   NVARCHAR(500),
        IsActive            BIT DEFAULT 1,
        DateJoined          DATETIME DEFAULT GETDATE(),
        LastActiveDate      DATETIME DEFAULT GETDATE(),
        CreatedAt           DATETIME DEFAULT GETDATE(),
        UpdatedAt           DATETIME DEFAULT GETDATE()
    );
    
    PRINT 'Partners table created successfully.';
END
ELSE
BEGIN
    PRINT 'Partners table already exists.';
END
GO

-- ============================================================================
-- 2. CREATE PARTNER TYPES REFERENCE TABLE (Optional)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PartnerTypes]') AND type in (N'U'))
BEGIN
    CREATE TABLE PartnerTypes (
        TypeID              INT PRIMARY KEY IDENTITY(1,1),
        TypeName            NVARCHAR(50) NOT NULL UNIQUE,
        Description         NVARCHAR(255),
        RequiresQualification BIT DEFAULT 0,
        IsActive            BIT DEFAULT 1,
        CreatedAt           DATETIME DEFAULT GETDATE()
    );
    
    -- Insert partner types
    INSERT INTO PartnerTypes (TypeName, Description, RequiresQualification, IsActive) VALUES
    ('Academic Tutor', 'Subject matter experts providing academic support', 1, 1),
    ('Peer Tutor', 'Student tutors assisting fellow students', 0, 1),
    ('Wellness Counselor', 'Mental health and wellness support professionals', 1, 1),
    ('Academic Advisor', 'Academic planning and course guidance specialists', 1, 1),
    ('Career Counselor', 'Career guidance and job placement specialists', 1, 1),
    ('Financial Aid Advisor', 'Financial assistance and scholarship guidance', 1, 1),
    ('Learning Coach', 'Study skills and learning strategies specialist', 1, 1),
    ('Peer Mentor', 'Experienced students providing guidance and support', 0, 1),
    ('Life Coach', 'Personal development and goal-setting specialist', 1, 1),
    ('Accessibility Coordinator', 'Support for students with disabilities', 1, 1);
    
    PRINT 'PartnerTypes table created and populated.';
END
GO

-- ============================================================================
-- 3. INSERT SAMPLE PARTNERS DATA
-- ============================================================================

-- Clear existing sample data if needed (uncomment if required)
-- DELETE FROM Partners WHERE PartnerName LIKE 'Dr.%' OR PartnerName LIKE '%Sample%';

-- Academic Tutors - Computer Science
INSERT INTO Partners (PartnerName, PartnerType, Specialization, UniversityID, ContactEmail, ContactPhone, OfficeLocation, AvailableHours, MaxStudents, CurrentStudents, HourlyRate, Rating, TotalReviews, Qualifications, Bio, IsActive, DateJoined, LastActiveDate) VALUES
('Dr. Michael Chen', 'Academic Tutor', 'Computer Science & Programming', 1, 'michael.chen@uct.ac.za', '+27 21 650 2712', 'CS Building Room 4.12', 'Mon-Fri 10AM-4PM', 15, 8, 450.00, 4.85, 127, 'PhD Computer Science (Stanford), MSc Software Engineering', 'Experienced software engineer turned educator with 10+ years in industry. Specializes in algorithms, data structures, and full-stack development.', 1, '2023-01-15', GETDATE()),

('Sarah Williams', 'Academic Tutor', 'Mathematics & Statistics', 2, 'sarah.williams@wits.ac.za', '+27 11 717 6543', 'Math Dept Office 201', 'Tue-Thu 9AM-5PM, Sat 9AM-1PM', 20, 12, 380.00, 4.72, 89, 'MSc Applied Mathematics (Wits), BSc Honours Mathematics', 'Passionate about making mathematics accessible to all students. Specializes in calculus, linear algebra, and statistical analysis.', 1, '2022-08-20', GETDATE()),

('Ahmed Hassan', 'Peer Tutor', 'Physics & Engineering', 3, 'ahmed.hassan@uj.ac.za', '+27 11 559 2345', 'Engineering Lab B-102', 'Mon-Wed 2PM-6PM', 10, 5, 180.00, 4.60, 45, 'Final Year Engineering Student, Dean\'s List 2024-2025', 'Top performing engineering student with strong physics background. Friendly and patient tutoring style.', 1, '2024-09-01', GETDATE()),

-- Wellness Counselors
('Dr. Nomsa Mbeki', 'Wellness Counselor', 'Mental Health & Stress Management', 4, 'nomsa.mbeki@ukzn.ac.za', '+27 31 260 7890', 'Student Wellness Center', 'Mon-Fri 8AM-5PM', 25, 18, 650.00, 4.90, 156, 'PhD Clinical Psychology (UCT), MA Counselling Psychology', 'Specialized in student mental health, anxiety, depression, and academic stress. Provides both individual and group counseling.', 1, '2021-03-10', GETDATE()),

('James Thompson', 'Wellness Counselor', 'Substance Abuse & Addiction', 1, 'james.thompson@uct.ac.za', '+27 21 650 4567', 'Health Sciences Campus', 'Tue-Sat 9AM-6PM', 15, 6, 550.00, 4.65, 78, 'MA Social Work (Addiction Studies), Certified Addiction Counselor', 'Experienced in helping students overcome substance abuse issues and develop healthy coping mechanisms.', 1, '2022-11-05', GETDATE()),

-- Academic Advisors
('Prof. Catherine Lebeko', 'Academic Advisor', 'Business & Commerce Programs', 2, 'catherine.lebeko@wits.ac.za', '+27 11 717 8901', 'Commerce Building Room 305', 'Mon-Fri 9AM-4PM', 30, 24, 0.00, 4.78, 201, 'PhD Business Administration (GIBS), MBA Finance, BCom Honours', 'Senior academic with 15 years experience in business education. Helps students navigate commerce degree requirements and career planning.', 1, '2020-02-14', GETDATE()),

('Dr. Priya Patel', 'Academic Advisor', 'Science & Technology Programs', 3, 'priya.patel@uj.ac.za', '+27 11 559 3456', 'Science Faculty Office 12', 'Mon-Thu 10AM-3PM', 25, 19, 0.00, 4.82, 134, 'PhD Biotechnology (Wits), MSc Biochemistry', 'Guides students through science degree pathways, research opportunities, and graduate school preparation.', 1, '2021-07-22', GETDATE()),

-- Career Counselors
('Linda van der Merwe', 'Career Counselor', 'STEM Career Development', 5, 'linda.vandermerwe@sun.ac.za', '+27 21 808 9123', 'Career Services Center', 'Mon-Wed-Fri 8AM-5PM', 20, 11, 420.00, 4.70, 92, 'MA Industrial Psychology (Stellenbosch), Career Development Certification', 'Helps STEM students transition from academia to industry. Strong connections with tech companies and research institutions.', 1, '2022-05-18', GETDATE()),

-- Financial Aid Advisors
('Robert Nkomo', 'Financial Aid Advisor', 'Scholarships & Bursaries', 6, 'robert.nkomo@up.ac.za', '+27 12 420 3456', 'Student Financial Aid Office', 'Mon-Fri 8AM-4:30PM', 40, 32, 0.00, 4.55, 167, 'BCom Financial Management (UP), Financial Aid Specialist Certification', 'Assists students with financial aid applications, scholarship opportunities, and emergency funding. Fluent in English, Afrikaans, and Zulu.', 1, '2020-09-30', GETDATE()),

-- Learning Coaches
('Dr. Fatima Al-Rashid', 'Learning Coach', 'Study Skills & Time Management', 1, 'fatima.rashid@uct.ac.za', '+27 21 650 7890', 'Student Success Center Room 15', 'Tue-Thu 10AM-6PM', 18, 14, 380.00, 4.88, 143, 'PhD Educational Psychology (UCT), Learning Disabilities Specialist', 'Helps students develop effective study strategies, time management skills, and overcome learning challenges.', 1, '2021-10-12', GETDATE()),

-- Peer Mentors
('Thabo Molefe', 'Peer Mentor', 'First Year Student Support', 2, 'thabo.molefe@wits.ac.za', '+27 11 717 2345', 'Student Union Building', 'Mon-Wed 12PM-6PM', 8, 6, 120.00, 4.40, 25, 'Third Year Psychology Student, Peer Mentor Training Certificate', 'Final year student who helps first-year students adjust to university life. Warm and approachable mentoring style.', 1, '2025-02-01', GETDATE()),

('Jessica Adams', 'Peer Mentor', 'International Student Support', 4, 'jessica.adams@ukzn.ac.za', '+27 31 260 4567', 'International Office', 'Tue-Thu 1PM-5PM', 12, 9, 150.00, 4.75, 32, 'Final Year International Relations, Exchange Student Experience', 'Helps international students navigate South African university culture and academic systems.', 1, '2024-08-15', GETDATE()),

-- Accessibility Coordinators
('Dr. Susan Mitchell', 'Accessibility Coordinator', 'Disability Support Services', 3, 'susan.mitchell@uj.ac.za', '+27 11 559 7890', 'Disability Support Center', 'Mon-Fri 8AM-4PM', 35, 28, 0.00, 4.85, 89, 'PhD Special Needs Education (Wits), Disability Support Specialist', 'Coordinates accommodations and support services for students with disabilities. Experienced in assistive technology and adaptive learning.', 1, '2019-08-25', GETDATE()),

-- Life Coaches
('Mark Johnson', 'Life Coach', 'Personal Development & Goal Setting', 5, 'mark.johnson@sun.ac.za', '+27 21 808 7654', 'Student Development Center', 'Mon-Thu 9AM-5PM', 16, 10, 480.00, 4.73, 67, 'Certified Life Coach (ICF), BA Psychology (Stellenbosch)', 'Helps students set and achieve personal and academic goals, build confidence, and develop leadership skills.', 1, '2023-06-10', DATEADD(DAY, -2, GETDATE()));

-- ============================================================================
-- 4. UPDATE SUPPORT REQUESTS WITH PARTNER ASSIGNMENTS
-- ============================================================================

-- Assign partners to existing support requests
UPDATE SupportRequests 
SET AssignedPartnerID = 1 
WHERE RequestID = 1 AND RequestType = 'Academic Support';  -- Dr. Michael Chen for CS support

UPDATE SupportRequests 
SET AssignedPartnerID = 4 
WHERE RequestID = 2 AND RequestType = 'Wellness Support';  -- Dr. Nomsa Mbeki for wellness

UPDATE SupportRequests 
SET AssignedPartnerID = 9 
WHERE RequestID = 3 AND RequestType = 'Financial Aid';  -- Robert Nkomo for financial aid

UPDATE SupportRequests 
SET AssignedPartnerID = 2 
WHERE RequestID = 4 AND RequestType = 'Academic Support';  -- Sarah Williams for math tutoring

UPDATE SupportRequests 
SET AssignedPartnerID = 10 
WHERE RequestID = 5 AND RequestType = 'Wellness Support';  -- Dr. Fatima Al-Rashid for study skills

UPDATE SupportRequests 
SET AssignedPartnerID = 3 
WHERE RequestID = 6 AND RequestType = 'Academic Support';  -- Ahmed Hassan for physics

-- ============================================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IX_Partners_PartnerType ON Partners(PartnerType);
CREATE INDEX IX_Partners_Specialization ON Partners(Specialization);
CREATE INDEX IX_Partners_UniversityID ON Partners(UniversityID);
CREATE INDEX IX_Partners_IsActive ON Partners(IsActive);
CREATE INDEX IX_Partners_Rating ON Partners(Rating DESC);
CREATE INDEX IX_Partners_AvailableCapacity ON Partners(MaxStudents, CurrentStudents);

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================
PRINT 'Partners Data Population Complete!'
PRINT '=================================='

-- Show partner statistics
SELECT 
    PartnerType,
    COUNT(*) as Count,
    AVG(Rating) as AvgRating,
    AVG(CAST(CurrentStudents AS FLOAT) / CAST(MaxStudents AS FLOAT) * 100) as AvgCapacityUsed
FROM Partners 
WHERE IsActive = 1 
GROUP BY PartnerType
ORDER BY Count DESC;

-- Show partners by university
SELECT 
    u.UniversityName,
    COUNT(*) as PartnerCount,
    AVG(p.Rating) as AvgRating
FROM Partners p
    JOIN Universities u ON p.UniversityID = u.UniversityID
WHERE p.IsActive = 1
GROUP BY u.UniversityName
ORDER BY PartnerCount DESC;

-- Show current workload
SELECT 
    PartnerName,
    PartnerType,
    CurrentStudents,
    MaxStudents,
    CAST(CurrentStudents AS FLOAT) / CAST(MaxStudents AS FLOAT) * 100 as CapacityUsed,
    Rating
FROM Partners 
WHERE IsActive = 1 
ORDER BY CapacityUsed DESC;

-- Verify support request assignments
SELECT 
    sr.RequestID,
    sr.RequestType,
    sr.Status,
    p.PartnerName,
    p.PartnerType,
    p.Specialization
FROM SupportRequests sr
    LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
WHERE sr.IsActive = 1
ORDER BY sr.RequestID;

PRINT ''
PRINT 'Sample Partners data has been successfully populated!'
PRINT 'Partners are now available for assignment to support requests.'
PRINT 'API endpoints can now return partner information for coordinator dashboard.'

GO

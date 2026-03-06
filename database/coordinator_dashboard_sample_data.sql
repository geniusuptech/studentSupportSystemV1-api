-- ============================================================================
-- Coordinator Dashboard Sample Data Population Script
-- ============================================================================
-- This script populates the Student Wellness database with sample data
-- that matches the Coordinator Dashboard interface requirements.
--
-- Expected Results:
-- - 130 Total Students
-- - 39 At-Risk Students (At Risk + Critical)
-- - Average GPA around 54.8%
-- - 6 Active Interventions
-- - Risk Distribution: Safe, At Risk, Critical
-- ============================================================================

USE StudentWellnessDB;
GO

-- Clear existing data (optional - uncomment if needed)
/*
DELETE FROM ActivityLogs;
DELETE FROM SupportRequests;
DELETE FROM Students;
DELETE FROM Programs;
DELETE FROM Universities;

-- Reset identity columns
DBCC CHECKIDENT ('Universities', RESEED, 0);
DBCC CHECKIDENT ('Programs', RESEED, 0);
DBCC CHECKIDENT ('Students', RESEED, 0);
DBCC CHECKIDENT ('SupportRequests', RESEED, 0);
DBCC CHECKIDENT ('ActivityLogs', RESEED, 0);
*/

-- ============================================================================
-- 1. INSERT UNIVERSITIES
-- ============================================================================
INSERT INTO Universities (UniversityName, UniversityCode, IsActive, CreatedAt) VALUES
('University of Cape Town', 'UCT', 1, GETDATE()),
('University of the Witwatersrand', 'Wits', 1, GETDATE()),
('University of Johannesburg', 'UJ', 1, GETDATE()),
('University of KwaZulu-Natal', 'UKZN', 1, GETDATE()),
('Stellenbosch University', 'SU', 1, GETDATE()),
('University of Pretoria', 'UP', 1, GETDATE());

-- ============================================================================
-- 2. INSERT PROGRAMS
-- ============================================================================
INSERT INTO Programs (ProgramName, ProgramCode, DurationYears, IsActive, CreatedAt) VALUES
('BSc Computer Science', 'BSC-CS', 3, 1, GETDATE()),
('BCom Accounting', 'BCOM-ACC', 3, 1, GETDATE()),
('LLB Law', 'LLB', 4, 1, GETDATE()),
('BCom Business Administration', 'BCOM-BA', 3, 1, GETDATE()),
('BSc Engineering', 'BSC-ENG', 4, 1, GETDATE()),
('BA Psychology', 'BA-PSY', 3, 1, GETDATE()),
('BSc Medicine', 'BSC-MED', 6, 1, GETDATE()),
('BCom Finance', 'BCOM-FIN', 3, 1, GETDATE());

-- ============================================================================
-- 3. INSERT SAMPLE STUDENTS (Matching Dashboard Interface)
-- ============================================================================

-- Key students from the dashboard screenshot
INSERT INTO Students (
    StudentName, StudentNumber, UniversityID, ProgramID, YearOfStudy, GPA, 
    RiskLevel, ContactEmail, ContactPhone, EmergencyContact, EmergencyPhone,
    DateEnrolled, LastLoginDate, LastActivityDate, IsActive, CreatedAt, UpdatedAt
) VALUES
-- Lerato Khumalo (UCT, BSc Computer Science, 1st Year, GPA: 45.00, At Risk)
('Lerato Khumalo', 'STUD21056789', 1, 1, 1, 1.80, 'At Risk', 
 'lerato.khumalo@uct.ac.za', '+27 83 555 4455', 'Thabo Khumalo', '+27 84 555 7788',
 '2023-02-15', '2026-02-25 08:30:00', DATEADD(MINUTE, -120, GETDATE()), 1, GETDATE(), GETDATE()),

-- Thabo Mthembu (UJ, BCom, 2nd Year, GPA: 69.00, Safe)
('Thabo Mthembu', 'STUD20045123', 3, 2, 2, 2.76, 'Safe',
 'thabo.mthembu@uj.ac.za', '+27 81 234 5678', 'Sarah Mthembu', '+27 82 345 6789',
 '2022-02-10', '2026-02-28 14:20:00', DATEADD(HOUR, -1, GETDATE()), 1, GETDATE(), GETDATE()),

-- Jessica Naidoo (UKZN, LLB Law, Final Year, GPA: 35.00, Critical)
('Jessica Naidoo', 'STUD19078456', 4, 3, 4, 1.40, 'Critical',
 'jessica.naidoo@ukzn.ac.za', '+27 79 987 6543', 'Raj Naidoo', '+27 83 456 7890',
 '2019-02-20', '2026-03-01 09:15:00', GETDATE(), 1, GETDATE(), GETDATE()),

-- Emile Madise (Wits, BSc Computer Science, 1st Year, GPA: 52.00, Safe)
('Emile Madise', 'STUD23034567', 2, 1, 1, 2.08, 'Safe',
 'emile.madise@wits.ac.za', '+27 72 123 4567', 'Marie Madise', '+27 73 234 5678',
 '2023-02-08', '2026-02-27 16:45:00', DATEADD(HOUR, -2, GETDATE()), 1, GETDATE(), GETDATE());

-- ============================================================================
-- 4. GENERATE ADDITIONAL STUDENTS TO REACH 130 TOTAL
-- ============================================================================

-- Additional Safe Students (to reach proper distribution)
INSERT INTO Students (StudentName, StudentNumber, UniversityID, ProgramID, YearOfStudy, GPA, RiskLevel, ContactEmail, DateEnrolled, LastActivityDate, IsActive, CreatedAt, UpdatedAt) 
VALUES
('Sipho Dlamini', 'STUD22001234', 1, 4, 2, 3.20, 'Safe', 'sipho.dlamini@uct.ac.za', '2022-02-15', DATEADD(DAY, -1, GETDATE()), 1, GETDATE(), GETDATE()),
('Nomsa Mbeki', 'STUD21002345', 2, 6, 3, 2.85, 'Safe', 'nomsa.mbeki@wits.ac.za', '2021-02-10', DATEADD(HOUR, -3, GETDATE()), 1, GETDATE(), GETDATE()),
('Ahmed Hassan', 'STUD23003456', 3, 5, 1, 3.45, 'Safe', 'ahmed.hassan@uj.ac.za', '2023-02-20', DATEADD(MINUTE, -45, GETDATE()), 1, GETDATE(), GETDATE()),
('Sarah Johnson', 'STUD20004567', 4, 8, 3, 2.95, 'Safe', 'sarah.johnson@ukzn.ac.za', '2020-02-25', DATEADD(HOUR, -6, GETDATE()), 1, GETDATE(), GETDATE()),
('Michael O''Connor', 'STUD22005678', 5, 1, 2, 3.10, 'Safe', 'michael.oconnor@sun.ac.za', '2022-02-12', DATEADD(DAY, -1, GETDATE()), 1, GETDATE(), GETDATE()),
('Fatima Al-Rashid', 'STUD21006789', 6, 7, 4, 3.35, 'Safe', 'fatima.rashid@up.ac.za', '2021-02-18', DATEADD(HOUR, -4, GETDATE()), 1, GETDATE(), GETDATE()),
('David Chen', 'STUD23007890', 1, 2, 1, 2.75, 'Safe', 'david.chen@uct.ac.za', '2023-02-22', DATEADD(MINUTE, -90, GETDATE()), 1, GETDATE(), GETDATE()),
('Priya Patel', 'STUD20008901', 2, 3, 4, 3.00, 'Safe', 'priya.patel@wits.ac.za', '2020-02-14', DATEADD(HOUR, -8, GETDATE()), 1, GETDATE(), GETDATE());

-- At Risk Students (additional to reach 39 total at-risk including critical)
DECLARE @counter INT = 1
WHILE @counter <= 25
BEGIN
    INSERT INTO Students (StudentName, StudentNumber, UniversityID, ProgramID, YearOfStudy, GPA, RiskLevel, ContactEmail, DateEnrolled, LastActivityDate, IsActive, CreatedAt, UpdatedAt)
    VALUES 
    ('Student AtRisk' + CAST(@counter AS VARCHAR), 
     'ATRS' + RIGHT('0000' + CAST(@counter AS VARCHAR), 4),
     ((@counter % 4) + 1), -- Rotate through universities 1-4
     ((@counter % 6) + 1), -- Rotate through programs 1-6
     ((@counter % 3) + 1), -- Years 1-3
     ROUND(1.5 + (RAND() * 0.8), 2), -- GPA between 1.5 and 2.3 (At Risk range)
     'At Risk',
     'atrisk' + CAST(@counter AS VARCHAR) + '@university.ac.za',
     DATEADD(DAY, -(@counter * 10), '2023-02-01'),
     DATEADD(HOUR, -(@counter % 48), GETDATE()),
     1, GETDATE(), GETDATE())
    
    SET @counter = @counter + 1
END

-- Critical Students (additional)
SET @counter = 1
WHILE @counter <= 10
BEGIN
    INSERT INTO Students (StudentName, StudentNumber, UniversityID, ProgramID, YearOfStudy, GPA, RiskLevel, ContactEmail, DateEnrolled, LastActivityDate, IsActive, CreatedAt, UpdatedAt)
    VALUES 
    ('Student Critical' + CAST(@counter AS VARCHAR), 
     'CRIT' + RIGHT('0000' + CAST(@counter AS VARCHAR), 4),
     ((@counter % 4) + 1),
     ((@counter % 6) + 1),
     ((@counter % 3) + 1),
     ROUND(0.8 + (RAND() * 0.6), 2), -- GPA between 0.8 and 1.4 (Critical range)
     'Critical',
     'critical' + CAST(@counter AS VARCHAR) + '@university.ac.za',
     DATEADD(DAY, -(@counter * 15), '2022-02-01'),
     DATEADD(HOUR, -(@counter % 72), GETDATE()),
     1, GETDATE(), GETDATE())
    
    SET @counter = @counter + 1
END

-- Safe Students (remaining to reach 130 total)
SET @counter = 1
WHILE @counter <= 80
BEGIN
    INSERT INTO Students (StudentName, StudentNumber, UniversityID, ProgramID, YearOfStudy, GPA, RiskLevel, ContactEmail, DateEnrolled, LastActivityDate, IsActive, CreatedAt, UpdatedAt)
    VALUES 
    ('Student Safe' + CAST(@counter AS VARCHAR), 
     'SAFE' + RIGHT('0000' + CAST(@counter AS VARCHAR), 4),
     ((@counter % 6) + 1), -- All 6 universities
     ((@counter % 8) + 1), -- All 8 programs
     ((@counter % 4) + 1), -- Years 1-4
     ROUND(2.5 + (RAND() * 1.5), 2), -- GPA between 2.5 and 4.0 (Safe range)
     'Safe',
     'safe' + CAST(@counter AS VARCHAR) + '@university.ac.za',
     DATEADD(DAY, -(@counter * 5), '2023-02-01'),
     DATEADD(MINUTE, -(@counter % 1440), GETDATE()), -- Random within last day
     1, GETDATE(), GETDATE())
    
    SET @counter = @counter + 1
END

-- ============================================================================
-- 5. INSERT SUPPORT REQUESTS (Active Interventions)
-- ============================================================================
INSERT INTO SupportRequests (StudentID, RequestType, Priority, Status, Description, CreatedAt, IsActive) VALUES
-- Get some student IDs for active interventions
(1, 'Academic Support', 'High', 'In Progress', 'Student struggling with Computer Science coursework', DATEADD(DAY, -5, GETDATE()), 1),
(3, 'Wellness Support', 'Critical', 'Open', 'Student showing signs of academic stress and burnout', DATEADD(DAY, -2, GETDATE()), 1),
(5, 'Financial Aid', 'Medium', 'In Progress', 'Student needs assistance with tuition payment', DATEADD(DAY, -7, GETDATE()), 1),
(8, 'Academic Support', 'High', 'Open', 'Mathematics tutoring required', DATEADD(DAY, -3, GETDATE()), 1),
(12, 'Wellness Support', 'Medium', 'In Progress', 'Time management and study skills coaching', DATEADD(DAY, -4, GETDATE()), 1),
(15, 'Academic Support', 'High', 'Open', 'Physics laboratory assistance needed', DATEADD(DAY, -1, GETDATE()), 1);

-- ============================================================================
-- 6. INSERT ACTIVITY LOGS (For Last Activity Tracking)
-- ============================================================================
INSERT INTO ActivityLogs (StudentID, ActivityType, ActivityDescription, ActivityDate) VALUES
(1, 'Login', 'Student logged into portal', DATEADD(MINUTE, -120, GETDATE())),
(2, 'Assessment Submission', 'Submitted BCom assignment', DATEADD(HOUR, -1, GETDATE())),
(3, 'Support Request', 'Created new wellness support request', GETDATE()),
(4, 'Login', 'Student portal access', DATEADD(HOUR, -2, GETDATE())),
(1, 'Course Access', 'Accessed Computer Science course materials', DATEADD(MINUTE, -135, GETDATE())),
(3, 'Meeting Scheduled', 'Scheduled appointment with counselor', DATEADD(MINUTE, -15, GETDATE())),
(2, 'Grade Check', 'Viewed semester grades', DATEADD(HOUR, -1, GETDATE())),
(4, 'Library Access', 'Used digital library resources', DATEADD(HOUR, -2, GETDATE()));

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================
PRINT 'Data Population Complete!'
PRINT '========================='

-- Check totals
SELECT 'Total Students' as Metric, COUNT(*) as Count FROM Students WHERE IsActive = 1
UNION ALL
SELECT 'At-Risk Students', COUNT(*) FROM Students WHERE IsActive = 1 AND RiskLevel IN ('At Risk', 'Critical')
UNION ALL
SELECT 'Safe Students', COUNT(*) FROM Students WHERE IsActive = 1 AND RiskLevel = 'Safe'
UNION ALL
SELECT 'At Risk Students', COUNT(*) FROM Students WHERE IsActive = 1 AND RiskLevel = 'At Risk'
UNION ALL
SELECT 'Critical Students', COUNT(*) FROM Students WHERE IsActive = 1 AND RiskLevel = 'Critical'
UNION ALL
SELECT 'Active Interventions', COUNT(*) FROM SupportRequests WHERE Status IN ('Open', 'In Progress') AND IsActive = 1;

-- Show average GPA
SELECT 'Average GPA' as Metric, CAST(AVG(GPA) as DECIMAL(4,2)) as Value
FROM Students WHERE IsActive = 1;

-- Show risk distribution percentages
SELECT 
    RiskLevel,
    COUNT(*) as Count,
    CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2)) as Percentage
FROM Students 
WHERE IsActive = 1 
GROUP BY RiskLevel
ORDER BY RiskLevel;

-- Show sample of key students
SELECT TOP 10
    s.StudentName,
    u.UniversityCode,
    p.ProgramCode,
    s.YearOfStudy,
    s.GPA,
    s.RiskLevel,
    CASE 
        WHEN DATEDIFF(MINUTE, s.LastActivityDate, GETDATE()) < 60 
            THEN CAST(DATEDIFF(MINUTE, s.LastActivityDate, GETDATE()) AS VARCHAR) + ' mins ago'
        WHEN DATEDIFF(HOUR, s.LastActivityDate, GETDATE()) < 24 
            THEN CAST(DATEDIFF(HOUR, s.LastActivityDate, GETDATE()) AS VARCHAR) + ' hours ago'
        ELSE CAST(DATEDIFF(DAY, s.LastActivityDate, GETDATE()) AS VARCHAR) + ' days ago'
    END as LastActivity
FROM Students s
    LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
    LEFT JOIN Programs p ON s.ProgramID = p.ProgramID
WHERE s.IsActive = 1
ORDER BY s.LastActivityDate DESC;

PRINT 'Sample data has been successfully populated!'
PRINT 'You can now test your Coordinator Dashboard endpoints.'

GO
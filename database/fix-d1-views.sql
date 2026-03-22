-- ============================================================================
-- FIXES FOR CLOUDFLARE D1 (SQLITE) SCHEMA
-- Adds missing views and ensures column names match between API and DB
-- ============================================================================

-- 1. Create vw_StudentDetails view (Used by StudentsRepository)
DROP VIEW IF EXISTS vw_StudentDetails;
CREATE VIEW vw_StudentDetails AS
SELECT
    s.StudentID,
    s.StudentName,
    s.StudentNumber,
    s.UniversityID,
    u.UniversityName,
    u.UniversityCode,
    s.ProgramID,
    p.ProgramName,
    p.ProgramCode,
    s.YearOfStudy,
    s.GPA,
    s.RiskLevel,
    -- The remote database uses ContactEmail/ContactPhone, so we use those directly
    s.ContactEmail,
    s.ContactPhone,
    u_user.FirstName,
    u_user.LastName,
    u_user.LastLoginDate,
    u_user.ProfilePictureURL,
    s.IsActive,
    s.CreatedAt,
    s.UpdatedAt,
    s.AssignedCoordinatorID
FROM Students s
LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
LEFT JOIN Programs p ON s.ProgramID = p.ProgramID
LEFT JOIN Users u_user ON s.StudentID = u_user.StudentID AND u_user.UserType = 'Student';

-- 2. Create vw_SupportRequestDetails view
DROP VIEW IF EXISTS vw_SupportRequestDetails;
CREATE VIEW vw_SupportRequestDetails AS
SELECT
    sr.RequestID,
    sr.Title,
    sr.Description,
    sr.Priority,
    sr.Status,
    s.StudentID,
    s.StudentName,
    s.StudentNumber,
    u.UniversityName,
    p.ProgramName,
    src.CategoryID,
    src.CategoryName,
    part.PartnerID,
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

-- 3. Create vw_RiskStatistics view
DROP VIEW IF EXISTS vw_RiskStatistics;
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

-- 4. Initial Categories (using standard names)
INSERT OR IGNORE INTO SupportRequestCategories (CategoryName, CategoryDescription, DefaultPriority) VALUES
('Academic Support Request', 'Tutoring and coursework help', 'Medium'),
('Wellness Support Request', 'Mental health and emotional well-being', 'High');

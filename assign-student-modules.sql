-- ============================================================================
-- Student Module Assignment Script (SQL Version)
-- ============================================================================
-- This script assigns modules to students based on their program of study
-- Updates the Module1, Module2, Module3, Module4 fields in the Students table
-- ============================================================================

USE StudentWellnessDB;
GO

-- First, let's check current status
PRINT 'Current Students without Module Assignments:';
SELECT 
    s.StudentID,
    s.StudentName,
    p.ProgramName,
    s.YearOfStudy,
    CASE 
        WHEN s.Module1 IS NULL AND s.Module2 IS NULL AND s.Module3 IS NULL AND s.Module4 IS NULL 
        THEN 'No Modules Assigned'
        ELSE 'Has Modules'
    END as ModuleStatus
FROM Students s
INNER JOIN Programs p ON s.ProgramID = p.ProgramID
WHERE s.IsActive = 1
ORDER BY p.ProgramName, s.StudentName;

PRINT CHAR(13) + CHAR(10) + 'Starting Module Assignment Process...';
PRINT '===================================================';

-- Computer Science Students (Program ID = 1)
PRINT 'Assigning modules to Computer Science students...';

UPDATE Students 
SET 
    Module1 = CASE 
        WHEN StudentID % 8 = 0 THEN 'Data Structures and Algorithms'
        WHEN StudentID % 8 = 1 THEN 'Object-Oriented Programming'
        WHEN StudentID % 8 = 2 THEN 'Database Management Systems'
        WHEN StudentID % 8 = 3 THEN 'Software Engineering'
        WHEN StudentID % 8 = 4 THEN 'Computer Networks'
        WHEN StudentID % 8 = 5 THEN 'Operating Systems'
        WHEN StudentID % 8 = 6 THEN 'Web Development'
        WHEN StudentID % 8 = 7 THEN 'Artificial Intelligence'
    END,
    Module2 = CASE 
        WHEN (StudentID + 1) % 8 = 0 THEN 'Data Structures and Algorithms'
        WHEN (StudentID + 1) % 8 = 1 THEN 'Object-Oriented Programming'
        WHEN (StudentID + 1) % 8 = 2 THEN 'Database Management Systems'
        WHEN (StudentID + 1) % 8 = 3 THEN 'Software Engineering'
        WHEN (StudentID + 1) % 8 = 4 THEN 'Computer Networks'
        WHEN (StudentID + 1) % 8 = 5 THEN 'Operating Systems'
        WHEN (StudentID + 1) % 8 = 6 THEN 'Web Development'
        WHEN (StudentID + 1) % 8 = 7 THEN 'Artificial Intelligence'
    END,
    Module3 = CASE 
        WHEN (StudentID + 2) % 8 = 0 THEN 'Data Structures and Algorithms'
        WHEN (StudentID + 2) % 8 = 1 THEN 'Object-Oriented Programming'
        WHEN (StudentID + 2) % 8 = 2 THEN 'Database Management Systems'
        WHEN (StudentID + 2) % 8 = 3 THEN 'Software Engineering'
        WHEN (StudentID + 2) % 8 = 4 THEN 'Computer Networks'
        WHEN (StudentID + 2) % 8 = 5 THEN 'Operating Systems'
        WHEN (StudentID + 2) % 8 = 6 THEN 'Web Development'
        WHEN (StudentID + 2) % 8 = 7 THEN 'Artificial Intelligence'
    END,
    Module4 = CASE 
        WHEN (StudentID + 3) % 8 = 0 THEN 'Data Structures and Algorithms'
        WHEN (StudentID + 3) % 8 = 1 THEN 'Object-Oriented Programming'
        WHEN (StudentID + 3) % 8 = 2 THEN 'Database Management Systems'
        WHEN (StudentID + 3) % 8 = 3 THEN 'Software Engineering'
        WHEN (StudentID + 3) % 8 = 4 THEN 'Computer Networks'
        WHEN (StudentID + 3) % 8 = 5 THEN 'Operating Systems'
        WHEN (StudentID + 3) % 8 = 6 THEN 'Web Development'
        WHEN (StudentID + 3) % 8 = 7 THEN 'Artificial Intelligence'
    END,
    UpdatedAt = GETDATE()
WHERE ProgramID = 1 AND IsActive = 1;

PRINT CONCAT('Updated ', @@ROWCOUNT, ' Computer Science students');

-- Business Administration Students (Program ID = 2)
PRINT 'Assigning modules to Business Administration students...';

UPDATE Students 
SET 
    Module1 = CASE 
        WHEN StudentID % 8 = 0 THEN 'Business Management'
        WHEN StudentID % 8 = 1 THEN 'Financial Accounting'
        WHEN StudentID % 8 = 2 THEN 'Marketing Principles'
        WHEN StudentID % 8 = 3 THEN 'Human Resource Management'
        WHEN StudentID % 8 = 4 THEN 'Operations Management'
        WHEN StudentID % 8 = 5 THEN 'Strategic Management'
        WHEN StudentID % 8 = 6 THEN 'Business Statistics'
        WHEN StudentID % 8 = 7 THEN 'Entrepreneurship'
    END,
    Module2 = CASE 
        WHEN (StudentID + 2) % 8 = 0 THEN 'Business Management'
        WHEN (StudentID + 2) % 8 = 1 THEN 'Financial Accounting'
        WHEN (StudentID + 2) % 8 = 2 THEN 'Marketing Principles'
        WHEN (StudentID + 2) % 8 = 3 THEN 'Human Resource Management'
        WHEN (StudentID + 2) % 8 = 4 THEN 'Operations Management'
        WHEN (StudentID + 2) % 8 = 5 THEN 'Strategic Management'
        WHEN (StudentID + 2) % 8 = 6 THEN 'Business Statistics'
        WHEN (StudentID + 2) % 8 = 7 THEN 'Entrepreneurship'
    END,
    Module3 = CASE 
        WHEN (StudentID + 4) % 8 = 0 THEN 'Business Management'
        WHEN (StudentID + 4) % 8 = 1 THEN 'Financial Accounting'
        WHEN (StudentID + 4) % 8 = 2 THEN 'Marketing Principles'
        WHEN (StudentID + 4) % 8 = 3 THEN 'Human Resource Management'
        WHEN (StudentID + 4) % 8 = 4 THEN 'Operations Management'
        WHEN (StudentID + 4) % 8 = 5 THEN 'Strategic Management'
        WHEN (StudentID + 4) % 8 = 6 THEN 'Business Statistics'
        WHEN (StudentID + 4) % 8 = 7 THEN 'Entrepreneurship'
    END,
    Module4 = CASE 
        WHEN (StudentID + 6) % 8 = 0 THEN 'Business Management'
        WHEN (StudentID + 6) % 8 = 1 THEN 'Financial Accounting'
        WHEN (StudentID + 6) % 8 = 2 THEN 'Marketing Principles'
        WHEN (StudentID + 6) % 8 = 3 THEN 'Human Resource Management'
        WHEN (StudentID + 6) % 8 = 4 THEN 'Operations Management'
        WHEN (StudentID + 6) % 8 = 5 THEN 'Strategic Management'
        WHEN (StudentID + 6) % 8 = 6 THEN 'Business Statistics'
        WHEN (StudentID + 6) % 8 = 7 THEN 'Entrepreneurship'
    END,
    UpdatedAt = GETDATE()
WHERE ProgramID = 2 AND IsActive = 1;

PRINT CONCAT('Updated ', @@ROWCOUNT, ' Business Administration students');

-- Engineering Students (Program ID = 3)
PRINT 'Assigning modules to Engineering students...';

UPDATE Students 
SET 
    Module1 = CASE 
        WHEN StudentID % 8 = 0 THEN 'Engineering Mathematics'
        WHEN StudentID % 8 = 1 THEN 'Physics for Engineers'
        WHEN StudentID % 8 = 2 THEN 'Engineering Design'
        WHEN StudentID % 8 = 3 THEN 'Materials Science'
        WHEN StudentID % 8 = 4 THEN 'Thermodynamics'
        WHEN StudentID % 8 = 5 THEN 'Fluid Mechanics'
        WHEN StudentID % 8 = 6 THEN 'Engineering Ethics'
        WHEN StudentID % 8 = 7 THEN 'Project Management'
    END,
    Module2 = CASE 
        WHEN (StudentID + 3) % 8 = 0 THEN 'Engineering Mathematics'
        WHEN (StudentID + 3) % 8 = 1 THEN 'Physics for Engineers'
        WHEN (StudentID + 3) % 8 = 2 THEN 'Engineering Design'
        WHEN (StudentID + 3) % 8 = 3 THEN 'Materials Science'
        WHEN (StudentID + 3) % 8 = 4 THEN 'Thermodynamics'
        WHEN (StudentID + 3) % 8 = 5 THEN 'Fluid Mechanics'
        WHEN (StudentID + 3) % 8 = 6 THEN 'Engineering Ethics'
        WHEN (StudentID + 3) % 8 = 7 THEN 'Project Management'
    END,
    Module3 = CASE 
        WHEN (StudentID + 5) % 8 = 0 THEN 'Engineering Mathematics'
        WHEN (StudentID + 5) % 8 = 1 THEN 'Physics for Engineers'
        WHEN (StudentID + 5) % 8 = 2 THEN 'Engineering Design'
        WHEN (StudentID + 5) % 8 = 3 THEN 'Materials Science'
        WHEN (StudentID + 5) % 8 = 4 THEN 'Thermodynamics'
        WHEN (StudentID + 5) % 8 = 5 THEN 'Fluid Mechanics'
        WHEN (StudentID + 5) % 8 = 6 THEN 'Engineering Ethics'
        WHEN (StudentID + 5) % 8 = 7 THEN 'Project Management'
    END,
    Module4 = CASE 
        WHEN (StudentID + 7) % 8 = 0 THEN 'Engineering Mathematics'
        WHEN (StudentID + 7) % 8 = 1 THEN 'Physics for Engineers'
        WHEN (StudentID + 7) % 8 = 2 THEN 'Engineering Design'
        WHEN (StudentID + 7) % 8 = 3 THEN 'Materials Science'
        WHEN (StudentID + 7) % 8 = 4 THEN 'Thermodynamics'
        WHEN (StudentID + 7) % 8 = 5 THEN 'Fluid Mechanics'
        WHEN (StudentID + 7) % 8 = 6 THEN 'Engineering Ethics'
        WHEN (StudentID + 7) % 8 = 7 THEN 'Project Management'
    END,
    UpdatedAt = GETDATE()
WHERE ProgramID = 3 AND IsActive = 1;

PRINT CONCAT('Updated ', @@ROWCOUNT, ' Engineering students');

-- Medicine Students (Program ID = 4)
PRINT 'Assigning modules to Medicine students...';

UPDATE Students 
SET 
    Module1 = CASE 
        WHEN StudentID % 8 = 0 THEN 'Human Anatomy'
        WHEN StudentID % 8 = 1 THEN 'Physiology'
        WHEN StudentID % 8 = 2 THEN 'Biochemistry'
        WHEN StudentID % 8 = 3 THEN 'Pathology'
        WHEN StudentID % 8 = 4 THEN 'Pharmacology'
        WHEN StudentID % 8 = 5 THEN 'Clinical Medicine'
        WHEN StudentID % 8 = 6 THEN 'Medical Ethics'
        WHEN StudentID % 8 = 7 THEN 'Public Health'
    END,
    Module2 = CASE 
        WHEN (StudentID + 1) % 8 = 0 THEN 'Human Anatomy'
        WHEN (StudentID + 1) % 8 = 1 THEN 'Physiology'
        WHEN (StudentID + 1) % 8 = 2 THEN 'Biochemistry'
        WHEN (StudentID + 1) % 8 = 3 THEN 'Pathology'
        WHEN (StudentID + 1) % 8 = 4 THEN 'Pharmacology'
        WHEN (StudentID + 1) % 8 = 5 THEN 'Clinical Medicine'
        WHEN (StudentID + 1) % 8 = 6 THEN 'Medical Ethics'
        WHEN (StudentID + 1) % 8 = 7 THEN 'Public Health'
    END,
    Module3 = CASE 
        WHEN (StudentID + 3) % 8 = 0 THEN 'Human Anatomy'
        WHEN (StudentID + 3) % 8 = 1 THEN 'Physiology'
        WHEN (StudentID + 3) % 8 = 2 THEN 'Biochemistry'
        WHEN (StudentID + 3) % 8 = 3 THEN 'Pathology'
        WHEN (StudentID + 3) % 8 = 4 THEN 'Pharmacology'
        WHEN (StudentID + 3) % 8 = 5 THEN 'Clinical Medicine'
        WHEN (StudentID + 3) % 8 = 6 THEN 'Medical Ethics'
        WHEN (StudentID + 3) % 8 = 7 THEN 'Public Health'
    END,
    Module4 = CASE 
        WHEN (StudentID + 5) % 8 = 0 THEN 'Human Anatomy'
        WHEN (StudentID + 5) % 8 = 1 THEN 'Physiology'
        WHEN (StudentID + 5) % 8 = 2 THEN 'Biochemistry'
        WHEN (StudentID + 5) % 8 = 3 THEN 'Pathology'
        WHEN (StudentID + 5) % 8 = 4 THEN 'Pharmacology'
        WHEN (StudentID + 5) % 8 = 5 THEN 'Clinical Medicine'
        WHEN (StudentID + 5) % 8 = 6 THEN 'Medical Ethics'
        WHEN (StudentID + 5) % 8 = 7 THEN 'Public Health'
    END,
    UpdatedAt = GETDATE()
WHERE ProgramID = 4 AND IsActive = 1;

PRINT CONCAT('Updated ', @@ROWCOUNT, ' Medicine students');

-- Psychology Students (Program ID = 5)
PRINT 'Assigning modules to Psychology students...';

UPDATE Students 
SET 
    Module1 = CASE 
        WHEN StudentID % 8 = 0 THEN 'Introduction to Psychology'
        WHEN StudentID % 8 = 1 THEN 'Cognitive Psychology'
        WHEN StudentID % 8 = 2 THEN 'Social Psychology'
        WHEN StudentID % 8 = 3 THEN 'Developmental Psychology'
        WHEN StudentID % 8 = 4 THEN 'Research Methods'
        WHEN StudentID % 8 = 5 THEN 'Statistics for Psychology'
        WHEN StudentID % 8 = 6 THEN 'Abnormal Psychology'
        WHEN StudentID % 8 = 7 THEN 'Counseling Psychology'
    END,
    Module2 = CASE 
        WHEN (StudentID + 2) % 8 = 0 THEN 'Introduction to Psychology'
        WHEN (StudentID + 2) % 8 = 1 THEN 'Cognitive Psychology'
        WHEN (StudentID + 2) % 8 = 2 THEN 'Social Psychology'
        WHEN (StudentID + 2) % 8 = 3 THEN 'Developmental Psychology'
        WHEN (StudentID + 2) % 8 = 4 THEN 'Research Methods'
        WHEN (StudentID + 2) % 8 = 5 THEN 'Statistics for Psychology'
        WHEN (StudentID + 2) % 8 = 6 THEN 'Abnormal Psychology'
        WHEN (StudentID + 2) % 8 = 7 THEN 'Counseling Psychology'
    END,
    Module3 = CASE 
        WHEN (StudentID + 4) % 8 = 0 THEN 'Introduction to Psychology'
        WHEN (StudentID + 4) % 8 = 1 THEN 'Cognitive Psychology'
        WHEN (StudentID + 4) % 8 = 2 THEN 'Social Psychology'
        WHEN (StudentID + 4) % 8 = 3 THEN 'Developmental Psychology'
        WHEN (StudentID + 4) % 8 = 4 THEN 'Research Methods'
        WHEN (StudentID + 4) % 8 = 5 THEN 'Statistics for Psychology'
        WHEN (StudentID + 4) % 8 = 6 THEN 'Abnormal Psychology'
        WHEN (StudentID + 4) % 8 = 7 THEN 'Counseling Psychology'
    END,
    Module4 = CASE 
        WHEN (StudentID + 6) % 8 = 0 THEN 'Introduction to Psychology'
        WHEN (StudentID + 6) % 8 = 1 THEN 'Cognitive Psychology'
        WHEN (StudentID + 6) % 8 = 2 THEN 'Social Psychology'
        WHEN (StudentID + 6) % 8 = 3 THEN 'Developmental Psychology'
        WHEN (StudentID + 6) % 8 = 4 THEN 'Research Methods'
        WHEN (StudentID + 6) % 8 = 5 THEN 'Statistics for Psychology'
        WHEN (StudentID + 6) % 8 = 6 THEN 'Abnormal Psychology'
        WHEN (StudentID + 6) % 8 = 7 THEN 'Counseling Psychology'
    END,
    UpdatedAt = GETDATE()
WHERE ProgramID = 5 AND IsActive = 1;

PRINT CONCAT('Updated ', @@ROWCOUNT, ' Psychology students');

-- Law Students (Program ID = 6)
PRINT 'Assigning modules to Law students...';

UPDATE Students 
SET 
    Module1 = CASE 
        WHEN StudentID % 8 = 0 THEN 'Constitutional Law'
        WHEN StudentID % 8 = 1 THEN 'Criminal Law'
        WHEN StudentID % 8 = 2 THEN 'Contract Law'
        WHEN StudentID % 8 = 3 THEN 'Commercial Law'
        WHEN StudentID % 8 = 4 THEN 'International Law'
        WHEN StudentID % 8 = 5 THEN 'Human Rights Law'
        WHEN StudentID % 8 = 6 THEN 'Legal Research'
        WHEN StudentID % 8 = 7 THEN 'Legal Ethics'
    END,
    Module2 = CASE 
        WHEN (StudentID + 3) % 8 = 0 THEN 'Constitutional Law'
        WHEN (StudentID + 3) % 8 = 1 THEN 'Criminal Law'
        WHEN (StudentID + 3) % 8 = 2 THEN 'Contract Law'
        WHEN (StudentID + 3) % 8 = 3 THEN 'Commercial Law'
        WHEN (StudentID + 3) % 8 = 4 THEN 'International Law'
        WHEN (StudentID + 3) % 8 = 5 THEN 'Human Rights Law'
        WHEN (StudentID + 3) % 8 = 6 THEN 'Legal Research'
        WHEN (StudentID + 3) % 8 = 7 THEN 'Legal Ethics'
    END,
    Module3 = CASE 
        WHEN (StudentID + 5) % 8 = 0 THEN 'Constitutional Law'
        WHEN (StudentID + 5) % 8 = 1 THEN 'Criminal Law'
        WHEN (StudentID + 5) % 8 = 2 THEN 'Contract Law'
        WHEN (StudentID + 5) % 8 = 3 THEN 'Commercial Law'
        WHEN (StudentID + 5) % 8 = 4 THEN 'International Law'
        WHEN (StudentID + 5) % 8 = 5 THEN 'Human Rights Law'
        WHEN (StudentID + 5) % 8 = 6 THEN 'Legal Research'
        WHEN (StudentID + 5) % 8 = 7 THEN 'Legal Ethics'
    END,
    Module4 = CASE 
        WHEN (StudentID + 7) % 8 = 0 THEN 'Constitutional Law'
        WHEN (StudentID + 7) % 8 = 1 THEN 'Criminal Law'
        WHEN (StudentID + 7) % 8 = 2 THEN 'Contract Law'
        WHEN (StudentID + 7) % 8 = 3 THEN 'Commercial Law'
        WHEN (StudentID + 7) % 8 = 4 THEN 'International Law'
        WHEN (StudentID + 7) % 8 = 5 THEN 'Human Rights Law'
        WHEN (StudentID + 7) % 8 = 6 THEN 'Legal Research'
        WHEN (StudentID + 7) % 8 = 7 THEN 'Legal Ethics'
    END,
    UpdatedAt = GETDATE()
WHERE ProgramID = 6 AND IsActive = 1;

PRINT CONCAT('Updated ', @@ROWCOUNT, ' Law students');

-- Summary Report
PRINT CHAR(13) + CHAR(10) + '===================================================';
PRINT 'MODULE ASSIGNMENT SUMMARY REPORT';
PRINT '===================================================';

SELECT 
    p.ProgramName,
    COUNT(*) as TotalStudents,
    COUNT(CASE WHEN s.Module1 IS NOT NULL THEN 1 END) as StudentsWithModules
FROM Students s
INNER JOIN Programs p ON s.ProgramID = p.ProgramID
WHERE s.IsActive = 1
GROUP BY p.ProgramName, p.ProgramID
ORDER BY p.ProgramID;

PRINT CHAR(13) + CHAR(10) + 'Sample Module Assignments by Program:';
PRINT '===================================================';

-- Show sample assignments for each program
SELECT TOP 2
    'Computer Science' as Program,
    s.StudentName,
    s.Module1,
    s.Module2,
    s.Module3,
    s.Module4
FROM Students s
WHERE s.ProgramID = 1 AND s.IsActive = 1
ORDER BY s.StudentID

UNION ALL

SELECT TOP 2
    'Business Administration' as Program,
    s.StudentName,
    s.Module1,
    s.Module2,
    s.Module3,
    s.Module4
FROM Students s
WHERE s.ProgramID = 2 AND s.IsActive = 1
ORDER BY s.StudentID

UNION ALL

SELECT TOP 2
    'Engineering' as Program,
    s.StudentName,
    s.Module1,
    s.Module2,
    s.Module3,
    s.Module4
FROM Students s
WHERE s.ProgramID = 3 AND s.IsActive = 1
ORDER BY s.StudentID

UNION ALL

SELECT TOP 2
    'Medicine' as Program,
    s.StudentName,
    s.Module1,
    s.Module2,
    s.Module3,
    s.Module4
FROM Students s
WHERE s.ProgramID = 4 AND s.IsActive = 1
ORDER BY s.StudentID

UNION ALL

SELECT TOP 2
    'Psychology' as Program,
    s.StudentName,
    s.Module1,
    s.Module2,
    s.Module3,
    s.Module4
FROM Students s
WHERE s.ProgramID = 5 AND s.IsActive = 1
ORDER BY s.StudentID

UNION ALL

SELECT TOP 2
    'Law' as Program,
    s.StudentName,
    s.Module1,
    s.Module2,
    s.Module3,
    s.Module4
FROM Students s
WHERE s.ProgramID = 6 AND s.IsActive = 1
ORDER BY s.StudentID;

PRINT CHAR(13) + CHAR(10) + '✅ Module assignment completed successfully!';
PRINT 'All students now have 4 modules assigned based on their program of study.';

GO
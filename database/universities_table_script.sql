-- ============================================================================
-- Universities Table Creation and Sample Data Script
-- ============================================================================
-- This script creates the Universities table and populates it with sample data
-- for South African universities in the Student Wellness Dashboard system.
-- ============================================================================

USE StudentWellness;
GO

-- ============================================================================
-- 1. CREATE UNIVERSITIES TABLE
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Universities]') AND type in (N'U'))
BEGIN
    CREATE TABLE Universities (
        UniversityID        INT PRIMARY KEY IDENTITY(1,1),
        UniversityName      NVARCHAR(255) NOT NULL UNIQUE,
        UniversityCode      NVARCHAR(10) NOT NULL UNIQUE,     -- e.g., UCT, UJ, UKZN, Wits
        FullName           NVARCHAR(500),                     -- Full official name
        EstablishedYear    INT,
        Province           NVARCHAR(100),
        City               NVARCHAR(100),
        Country            NVARCHAR(100) DEFAULT 'South Africa',
        PostalAddress      NVARCHAR(500),
        PhysicalAddress    NVARCHAR(500),
        MainPhone          NVARCHAR(20),
        MainEmail          NVARCHAR(255),
        Website            NVARCHAR(255),
        ViceChancellor     NVARCHAR(255),
        StudentPopulation  INT,                               -- Total enrolled students
        StaffCount         INT,                               -- Total academic and support staff
        CampusCount        INT DEFAULT 1,
        Type               NVARCHAR(50),                      -- Public, Private, University of Technology
        IsActive           BIT DEFAULT 1,
        LogoURL            NVARCHAR(500),
        CreatedAt          DATETIME DEFAULT GETDATE(),
        UpdatedAt          DATETIME DEFAULT GETDATE()
    );
    
    PRINT 'Universities table created successfully.';
END
ELSE
BEGIN
    PRINT 'Universities table already exists.';
END
GO

-- ============================================================================
-- 2. INSERT SAMPLE UNIVERSITIES DATA
-- ============================================================================

-- Clear existing sample data if needed (uncomment if required)
-- DELETE FROM Universities WHERE UniversityCode IN ('UCT', 'UJ', 'UKZN', 'WITS', 'SU', 'UP');

INSERT INTO Universities (
    UniversityName, 
    UniversityCode, 
    FullName, 
    EstablishedYear, 
    Province, 
    City, 
    PostalAddress, 
    PhysicalAddress, 
    MainPhone, 
    MainEmail, 
    Website, 
    ViceChancellor, 
    StudentPopulation, 
    StaffCount, 
    CampusCount, 
    Type, 
    IsActive, 
    LogoURL
) VALUES

-- University of Cape Town
(
    'University of Cape Town',
    'UCT',
    'University of Cape Town',
    1829,
    'Western Cape',
    'Cape Town',
    'Private Bag X3, Rondebosch 7701, South Africa',
    'University Avenue, Rondebosch, Cape Town, 7700',
    '+27 21 650 9111',
    'info@uct.ac.za',
    'https://www.uct.ac.za',
    'Prof. Mamokgethi Phakeng',
    29000,
    5200,
    6,
    'Public Research University',
    1,
    'https://www.uct.ac.za/sites/default/files/image_tool/images/328/logos/UCT-logo.png'
),

-- University of the Witwatersrand
(
    'University of the Witwatersrand',
    'WITS',
    'University of the Witwatersrand, Johannesburg',
    1922,
    'Gauteng',
    'Johannesburg',
    'Private Bag 3, Wits 2050, South Africa',
    '1 Jan Smuts Avenue, Braamfontein, Johannesburg, 2000',
    '+27 11 717 1000',
    'info@wits.ac.za',
    'https://www.wits.ac.za',
    'Prof. Zeblon Vilakazi',
    40000,
    5600,
    5,
    'Public Research University',
    1,
    'https://www.wits.ac.za/media/wits-university/brand-centre/logos/wits-logo.png'
),

-- University of Johannesburg
(
    'University of Johannesburg',
    'UJ',
    'University of Johannesburg',
    2005,
    'Gauteng',
    'Johannesburg',
    'PO Box 524, Auckland Park 2006, South Africa',
    'Corner Kingsway & University Roads, Auckland Park, Johannesburg, 2092',
    '+27 11 559 4555',
    'info@uj.ac.za',
    'https://www.uj.ac.za',
    'Prof. Tshilidzi Marwala',
    52000,
    6800,
    4,
    'Public Comprehensive University',
    1,
    'https://www.uj.ac.za/media/uj-media/brand-resources/UJ-logo.png'
),

-- University of KwaZulu-Natal
(
    'University of KwaZulu-Natal',
    'UKZN',
    'University of KwaZulu-Natal',
    2004,
    'KwaZulu-Natal',
    'Durban',
    'Private Bag X54001, Durban 4000, South Africa',
    'University Road, Westville, Durban, 3630',
    '+27 31 260 7111',
    'info@ukzn.ac.za',
    'https://www.ukzn.ac.za',
    'Prof. Nana Poku',
    47000,
    4200,
    5,
    'Public Research University',
    1,
    'https://www.ukzn.ac.za/images/ukzn-logo.png'
),

-- Stellenbosch University
(
    'Stellenbosch University',
    'SU',
    'Stellenbosch University',
    1918,
    'Western Cape',
    'Stellenbosch',
    'Private Bag X1, Matieland 7602, South Africa',
    'Ryneveld Street, Stellenbosch, 7600',
    '+27 21 808 9111',
    'info@sun.ac.za',
    'https://www.sun.ac.za',
    'Prof. Wim de Villiers',
    32000,
    3200,
    4,
    'Public Research University',
    1,
    'https://www.sun.ac.za/english/Documents/Logos/SU_HOR_RGB_E.jpg'
),

-- University of Pretoria
(
    'University of Pretoria',
    'UP',
    'University of Pretoria',
    1908,
    'Gauteng',
    'Pretoria',
    'Private Bag X20, Hatfield 0028, South Africa',
    'Lynnwood Road, Hatfield, Pretoria, 0002',
    '+27 12 420 4111',
    'info@up.ac.za',
    'https://www.up.ac.za',
    'Prof. Tawana Kupe',
    53000,
    4100,
    7,
    'Public Research University',
    1,
    'https://www.up.ac.za/media/shared/7/ZP_Files/up-logo.zp107946.png'
),

-- North-West University (Additional South African University)
(
    'North-West University',
    'NWU',
    'North-West University',
    2004,
    'North West',
    'Potchefstroom',
    'Private Bag X6001, Potchefstroom 2520, South Africa',
    '11 Hoffman Street, Potchefstroom, 2531',
    '+27 18 299 4900',
    'info@nwu.ac.za',
    'https://www.nwu.ac.za',
    'Prof. Dan Kgwadi',
    26000,
    2800,
    3,
    'Public Comprehensive University',
    1,
    'https://www.nwu.ac.za/sites/default/files/files/i-institutional-information/NWU-logo.png'
),

-- Rhodes University (Additional prestigious South African University)
(
    'Rhodes University',
    'RU',
    'Rhodes University',
    1904,
    'Eastern Cape',
    'Makhanda',
    'PO Box 94, Makhanda 6140, South Africa',
    'Drosty Road, Makhanda, 6139',
    '+27 46 603 8111',
    'info@ru.ac.za',
    'https://www.ru.ac.za',
    'Dr. Sizwe Mabizela',
    8500,
    900,
    1,
    'Public Research University',
    1,
    'https://www.ru.ac.za/media/rhodesuniversity/content/communications/images/RU-logo.png'
),

-- Cape Peninsula University of Technology
(
    'Cape Peninsula University of Technology',
    'CPUT',
    'Cape Peninsula University of Technology',
    2005,
    'Western Cape',
    'Cape Town',
    'PO Box 1906, Bellville 7535, South Africa',
    'Symphony Way, Bellville, 7535',
    '+27 21 959 6911',
    'info@cput.ac.za',
    'https://www.cput.ac.za',
    'Prof. Chris Nhlapo',
    32000,
    1800,
    6,
    'University of Technology',
    1,
    'https://www.cput.ac.za/storage/services/communications/cput-logo.png'
),

-- Tshwane University of Technology
(
    'Tshwane University of Technology',
    'TUT',
    'Tshwane University of Technology',
    2004,
    'Gauteng',
    'Pretoria',
    'Private Bag X680, Pretoria 0001, South Africa',
    'Staatsartillerie Road, Pretoria West, 0183',
    '+27 12 382 5911',
    'info@tut.ac.za',
    'https://www.tut.ac.za',
    'Prof. Lourens van Staden',
    60000,
    3500,
    6,
    'University of Technology',
    1,
    'https://www.tut.ac.za/media/tut-logo.png'
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IX_Universities_UniversityCode ON Universities(UniversityCode);
CREATE INDEX IX_Universities_Province ON Universities(Province);
CREATE INDEX IX_Universities_Type ON Universities(Type);
CREATE INDEX IX_Universities_IsActive ON Universities(IsActive);
CREATE INDEX IX_Universities_StudentPopulation ON Universities(StudentPopulation DESC);

-- ============================================================================
-- 4. CREATE UNIVERSITY FACULTIES/SCHOOLS TABLE (Optional Enhancement)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UniversityFaculties]') AND type in (N'U'))
BEGIN
    CREATE TABLE UniversityFaculties (
        FacultyID           INT PRIMARY KEY IDENTITY(1,1),
        UniversityID        INT FOREIGN KEY REFERENCES Universities(UniversityID),
        FacultyName         NVARCHAR(255) NOT NULL,
        FacultyCode         NVARCHAR(20),
        DeanName           NVARCHAR(255),
        ContactEmail       NVARCHAR(255),
        ContactPhone       NVARCHAR(20),
        BuildingLocation   NVARCHAR(255),
        IsActive           BIT DEFAULT 1,
        CreatedAt          DATETIME DEFAULT GETDATE()
    );

    -- Insert sample faculties for major universities
    INSERT INTO UniversityFaculties (UniversityID, FacultyName, FacultyCode, DeanName, ContactEmail) VALUES
    -- UCT Faculties
    (1, 'Faculty of Commerce', 'COM', 'Prof. Theresa Edlmann', 'commerce@uct.ac.za'),
    (1, 'Faculty of Engineering & the Built Environment', 'EBE', 'Prof. Francis Petersen', 'ebe@uct.ac.za'),
    (1, 'Faculty of Health Sciences', 'HSC', 'Prof. Bongani Mayosi', 'health@uct.ac.za'),
    (1, 'Faculty of Humanities', 'HUM', 'Prof. Sakhela Buhlungu', 'humanities@uct.ac.za'),
    (1, 'Faculty of Law', 'LAW', 'Prof. Penelope Andrews', 'law@uct.ac.za'),
    (1, 'Faculty of Science', 'SCI', 'Prof. Maano Ramutsindela', 'science@uct.ac.za'),
    
    -- Wits Faculties
    (2, 'Faculty of Commerce, Law and Management', 'CLM', 'Prof. Kuku Voyi', 'clm@wits.ac.za'),
    (2, 'Faculty of Engineering and the Built Environment', 'EBE', 'Prof. Iakovos Venieris', 'ebe@wits.ac.za'),
    (2, 'Faculty of Health Sciences', 'HSC', 'Prof. Martin Veller', 'health@wits.ac.za'),
    (2, 'Faculty of Humanities', 'HUM', 'Prof. Ruksana Osman', 'humanities@wits.ac.za'),
    (2, 'Faculty of Science', 'SCI', 'Prof. Helder Marques', 'science@wits.ac.za'),
    
    -- UJ Faculties
    (3, 'Faculty of Engineering and the Built Environment', 'FEBE', 'Prof. Sunil Maharaj', 'febe@uj.ac.za'),
    (3, 'Faculty of Health Sciences', 'FHS', 'Prof. Angina Parusnath', 'fhs@uj.ac.za'),
    (3, 'Faculty of Humanities', 'FH', 'Prof. Shireen Hassim', 'fh@uj.ac.za'),
    (3, 'Faculty of Management', 'FM', 'Prof. Cecile Schultz', 'fm@uj.ac.za'),
    (3, 'Faculty of Science', 'FS', 'Prof. Kesh Govinder', 'fs@uj.ac.za');
    
    PRINT 'UniversityFaculties table created and populated.';
END
GO

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================
PRINT 'Universities Data Population Complete!'
PRINT '====================================='

-- Show all universities
SELECT 
    UniversityID,
    UniversityName,
    UniversityCode,
    Province,
    City,
    StudentPopulation,
    Type,
    EstablishedYear
FROM Universities 
WHERE IsActive = 1 
ORDER BY StudentPopulation DESC;

-- Show universities by province
SELECT 
    Province,
    COUNT(*) as UniversityCount,
    SUM(StudentPopulation) as TotalStudents,
    AVG(StudentPopulation) as AvgStudentPopulation
FROM Universities 
WHERE IsActive = 1 
GROUP BY Province
ORDER BY TotalStudents DESC;

-- Show universities by type
SELECT 
    Type,
    COUNT(*) as Count,
    AVG(StudentPopulation) as AvgStudentPopulation,
    MIN(EstablishedYear) as EarliestFounded,
    MAX(EstablishedYear) as LatestFounded
FROM Universities 
WHERE IsActive = 1 
GROUP BY Type
ORDER BY Count DESC;

-- Show largest universities
SELECT TOP 5
    UniversityName,
    UniversityCode,
    Province,
    StudentPopulation,
    StaffCount,
    CAST(StudentPopulation AS FLOAT) / CAST(StaffCount AS FLOAT) as StudentStaffRatio
FROM Universities 
WHERE IsActive = 1 AND StudentPopulation IS NOT NULL AND StaffCount IS NOT NULL
ORDER BY StudentPopulation DESC;

-- Show faculties per university (if UniversityFaculties table exists)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UniversityFaculties]') AND type in (N'U'))
BEGIN
    SELECT 
        u.UniversityName,
        u.UniversityCode,
        COUNT(f.FacultyID) as FacultyCount,
        STRING_AGG(f.FacultyName, ', ') as Faculties
    FROM Universities u
        LEFT JOIN UniversityFaculties f ON u.UniversityID = f.UniversityID
    WHERE u.IsActive = 1 AND f.IsActive = 1
    GROUP BY u.UniversityID, u.UniversityName, u.UniversityCode
    ORDER BY FacultyCount DESC;
END

PRINT ''
PRINT 'Universities data has been successfully populated!'
PRINT 'Total universities created: ' + CAST((SELECT COUNT(*) FROM Universities WHERE IsActive = 1) AS VARCHAR)
PRINT 'Universities ready for student enrollment and partner assignments.'

GO

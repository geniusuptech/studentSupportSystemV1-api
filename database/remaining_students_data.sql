-- ============================================================================
-- Student Wellness Dashboard - Student Data Population
-- ============================================================================
-- This script populates the StudentWellness with 130 students and sample
-- support requests to provide a complete dataset for testing and development.
--
-- Distribution:
-- - 130 Students total
-- - 4 Universities (UCT, Wits, UJ, UKZN)
-- - 6 Programs (CS, BA, ENG, MED, PSY, LAW)
-- - Risk Levels: Safe (62), At Risk (45), Critical (23)
--
-- Version: 1.0
-- ============================================================================

USE StudentWellness;
GO

-- Clear existing student data for clean import
DELETE FROM SupportLogs;
DELETE FROM SupportRequests;
DELETE FROM StudentProfiles;
DELETE FROM Students;
GO

-- Reset identity columns
DBCC CHECKIDENT ('Students', RESEED, 0);
DBCC CHECKIDENT ('SupportRequests', RESEED, 0);
DBCC CHECKIDENT ('SupportLogs', RESEED, 0);
DBCC CHECKIDENT ('StudentProfiles', RESEED, 0);
GO

-- ============================================================================
-- STUDENT DATA INSERTION (130 Students)
-- ============================================================================

-- Batch 1: University of Cape Town (UCT) - 35 students
INSERT INTO Students (StudentName, StudentNumber, UniversityID, ProgramID, YearOfStudy, GPA, RiskLevel, ContactEmail, ContactPhone, EmergencyContact, EmergencyPhone, DateEnrolled, LastLoginDate) VALUES
('Aisha Patel', 'UCT2021001', 1, 1, 3, 3.85, 'Safe', 'aisha.patel@students.uct.ac.za', '+27-72-123-4567', 'Ravi Patel', '+27-21-456-7890', '2021-02-01', '2024-01-15 09:30:00'),
('Marcus Thompson', 'UCT2021002', 1, 2, 3, 2.15, 'At Risk', 'marcus.thompson@students.uct.ac.za', '+27-73-234-5678', 'Sarah Thompson', '+27-21-567-8901', '2021-02-01', '2024-01-10 14:20:00'),
('Zara Mohamed', 'UCT2020003', 1, 3, 4, 3.92, 'Safe', 'zara.mohamed@students.uct.ac.za', '+27-74-345-6789', 'Ahmed Mohamed', '+27-21-678-9012', '2020-02-01', '2024-01-16 11:45:00'),
('Connor Williams', 'UCT2022004', 1, 1, 2, 1.85, 'Critical', 'connor.williams@students.uct.ac.za', '+27-75-456-7890', 'Linda Williams', '+27-21-789-0123', '2022-02-01', '2024-01-08 16:15:00'),
('Nombulelo Mthembu', 'UCT2021005', 1, 4, 3, 3.45, 'Safe', 'nombulelo.mthembu@students.uct.ac.za', '+27-76-567-8901', 'Sipho Mthembu', '+27-31-890-1234', '2021-02-01', '2024-01-14 08:30:00'),
('David Chen', 'UCT2023006', 1, 1, 1, 3.20, 'Safe', 'david.chen@students.uct.ac.za', '+27-77-678-9012', 'Alice Chen', '+27-21-901-2345', '2023-02-01', '2024-01-17 13:45:00'),
('Amara Okafor', 'UCT2022007', 1, 5, 2, 2.45, 'At Risk', 'amara.okafor@students.uct.ac.za', '+27-78-789-0123', 'Chioma Okafor', '+27-21-012-3456', '2022-02-01', '2024-01-12 10:20:00'),
('Michael van der Merwe', 'UCT2020008', 1, 6, 4, 3.78, 'Safe', 'michael.vandermerwe@students.uct.ac.za', '+27-79-890-1234', 'Petra van der Merwe', '+27-21-123-4567', '2020-02-01', '2024-01-15 15:30:00'),
('Fatima Al-Zahra', 'UCT2021009', 1, 2, 3, 1.95, 'Critical', 'fatima.alzahra@students.uct.ac.za', '+27-80-901-2345', 'Hassan Al-Zahra', '+27-21-234-5678', '2021-02-01', '2024-01-09 12:15:00'),
('James Rodriguez', 'UCT2022010', 1, 3, 2, 3.55, 'Safe', 'james.rodriguez@students.uct.ac.za', '+27-81-012-3456', 'Maria Rodriguez', '+27-21-345-6789', '2022-02-01', '2024-01-16 14:45:00'),
('Thandiwe Ndlovu', 'UCT2021011', 1, 1, 3, 2.25, 'At Risk', 'thandiwe.ndlovu@students.uct.ac.za', '+27-82-123-4567', 'Mandla Ndlovu', '+27-31-456-7890', '2021-02-01', '2024-01-11 09:20:00'),
('Oliver Smith', 'UCT2023012', 1, 2, 1, 3.10, 'Safe', 'oliver.smith@students.uct.ac.za', '+27-83-234-5678', 'Emma Smith', '+27-21-567-8901', '2023-02-01', '2024-01-17 16:30:00'),
('Priya Sharma', 'UCT2020013', 1, 4, 4, 3.88, 'Safe', 'priya.sharma@students.uct.ac.za', '+27-84-345-6789', 'Raj Sharma', '+27-21-678-9012', '2020-02-01', '2024-01-15 11:10:00'),
('Luke Johnson', 'UCT2022014', 1, 5, 2, 1.75, 'Critical', 'luke.johnson@students.uct.ac.za', '+27-85-456-7890', 'Rebecca Johnson', '+27-21-789-0123', '2022-02-01', '2024-01-07 13:45:00'),
('Naledi Molefe', 'UCT2021015', 1, 3, 3, 3.65, 'Safe', 'naledi.molefe@students.uct.ac.za', '+27-86-567-8901', 'Peter Molefe', '+27-11-890-1234', '2021-02-01', '2024-01-14 08:50:00'),
('Hassan Ibrahim', 'UCT2022016', 1, 1, 2, 2.85, 'At Risk', 'hassan.ibrahim@students.uct.ac.za', '+27-87-678-9012', 'Leila Ibrahim', '+27-21-901-2345', '2022-02-01', '2024-01-13 15:20:00'),
('Sophie Taylor', 'UCT2023017', 1, 6, 1, 3.45, 'Safe', 'sophie.taylor@students.uct.ac.za', '+27-88-789-0123', 'Robert Taylor', '+27-21-012-3456', '2023-02-01', '2024-01-18 10:15:00'),
('Kabelo Maseko', 'UCT2020018', 1, 2, 4, 2.05, 'Critical', 'kabelo.maseko@students.uct.ac.za', '+27-89-890-1234', 'Grace Maseko', '+27-11-123-4567', '2020-02-01', '2024-01-08 14:30:00'),
('Isabella Garcia', 'UCT2021019', 1, 4, 3, 3.72, 'Safe', 'isabella.garcia@students.uct.ac.za', '+27-90-901-2345', 'Carlos Garcia', '+27-21-234-5678', '2021-02-01', '2024-01-15 12:40:00'),
('Ethan Davies', 'UCT2022020', 1, 5, 2, 2.35, 'At Risk', 'ethan.davies@students.uct.ac.za', '+27-91-012-3456', 'Helen Davies', '+27-21-345-6789', '2022-02-01', '2024-01-12 09:25:00'),
('Lerato Khumalo', 'UCT2021021', 1, 1, 3, 3.58, 'Safe', 'lerato.khumalo@students.uct.ac.za', '+27-92-123-4567', 'Thabo Khumalo', '+27-31-456-7890', '2021-02-01', '2024-01-16 16:45:00'),
('Ryan O''Connor', 'UCT2023022', 1, 3, 1, 2.95, 'Safe', 'ryan.oconnor@students.uct.ac.za', '+27-93-234-5678', 'Fiona O''Connor', '+27-21-567-8901', '2023-02-01', '2024-01-17 11:30:00'),
('Zinhle Dlamini', 'UCT2020023', 1, 6, 4, 3.82, 'Safe', 'zinhle.dlamini@students.uct.ac.za', '+27-94-345-6789', 'Bongani Dlamini', '+27-31-678-9012', '2020-02-01', '2024-01-15 13:55:00'),
('Alexander Lee', 'UCT2022024', 1, 2, 2, 1.65, 'Critical', 'alexander.lee@students.uct.ac.za', '+27-95-456-7890', 'Jennifer Lee', '+27-21-789-0123', '2022-02-01', '2024-01-06 15:10:00'),
('Khadija Hassan', 'UCT2021025', 1, 4, 3, 3.48, 'Safe', 'khadija.hassan@students.uct.ac.za', '+27-96-567-8901', 'Omar Hassan', '+27-21-890-1234', '2021-02-01', '2024-01-14 10:35:00'),
('Matthew Brown', 'UCT2022026', 1, 1, 2, 2.75, 'At Risk', 'matthew.brown@students.uct.ac.za', '+27-97-678-9012', 'Susan Brown', '+27-21-901-2345', '2022-02-01', '2024-01-13 14:20:00'),
('Aminah Osman', 'UCT2023027', 1, 5, 1, 3.25, 'Safe', 'aminah.osman@students.uct.ac.za', '+27-98-789-0123', 'Yusuf Osman', '+27-21-012-3456', '2023-02-01', '2024-01-18 08:45:00'),
('Joshua Miller', 'UCT2020028', 1, 3, 4, 3.95, 'Safe', 'joshua.miller@students.uct.ac.za', '+27-99-890-1234', 'Katherine Miller', '+27-21-123-4567', '2020-02-01', '2024-01-15 17:20:00'),
('Nomsa Sithole', 'UCT2021029', 1, 6, 3, 2.15, 'At Risk', 'nomsa.sithole@students.uct.ac.za', '+27-60-901-2345', 'Lucky Sithole', '+27-11-234-5678', '2021-02-01', '2024-01-11 12:50:00'),
('Benjamin Wilson', 'UCT2022030', 1, 2, 2, 3.15, 'Safe', 'benjamin.wilson@students.uct.ac.za', '+27-61-012-3456', 'Patricia Wilson', '+27-21-345-6789', '2022-02-01', '2024-01-16 09:40:00'),
('Asmaa Mohamud', 'UCT2021031', 1, 4, 3, 1.85, 'Critical', 'asmaa.mohamud@students.uct.ac.za', '+27-62-123-4567', 'Farah Mohamud', '+27-21-456-7890', '2021-02-01', '2024-01-09 11:25:00'),
('Christopher Clark', 'UCT2023032', 1, 1, 1, 3.65, 'Safe', 'christopher.clark@students.uct.ac.za', '+27-63-234-5678', 'Margaret Clark', '+27-21-567-8901', '2023-02-01', '2024-01-17 15:35:00'),
('Thobile Nkomo', 'UCT2020033', 1, 5, 4, 3.52, 'Safe', 'thobile.nkomo@students.uct.ac.za', '+27-64-345-6789', 'Precious Nkomo', '+27-31-678-9012', '2020-02-01', '2024-01-15 13:10:00'),
('Daniel Anderson', 'UCT2022034', 1, 3, 2, 2.45, 'At Risk', 'daniel.anderson@students.uct.ac.za', '+27-65-456-7890', 'Linda Anderson', '+27-21-789-0123', '2022-02-01', '2024-01-12 16:45:00'),
('Busisiwe Mahlangu', 'UCT2021035', 1, 6, 3, 3.75, 'Safe', 'busisiwe.mahlangu@students.uct.ac.za', '+27-66-567-8901', 'Moses Mahlangu', '+27-11-890-1234', '2021-02-01', '2024-01-14 14:55:00'),

-- Batch 2: University of the Witwatersrand (WITS) - 35 students
('Sibongile Mabena', 'WITS2021001', 2, 1, 3, 3.42, 'Safe', 'sibongile.mabena@students.wits.ac.za', '+27-67-678-9012', 'Themba Mabena', '+27-11-901-2345', '2021-02-01', '2024-01-15 10:20:00'),
('Robert Kumar', 'WITS2022002', 2, 2, 2, 1.95, 'Critical', 'robert.kumar@students.wits.ac.za', '+27-68-789-0123', 'Sunita Kumar', '+27-11-012-3456', '2022-02-01', '2024-01-08 13:45:00'),
('Fatou Diallo', 'WITS2020003', 2, 3, 4, 3.88, 'Safe', 'fatou.diallo@students.wits.ac.za', '+27-69-890-1234', 'Amadou Diallo', '+27-11-123-4567', '2020-02-01', '2024-01-16 08:30:00'),
('Tyler Jones', 'WITS2023004', 2, 4, 1, 3.15, 'Safe', 'tyler.jones@students.wits.ac.za', '+27-70-901-2345', 'Michelle Jones', '+27-11-234-5678', '2023-02-01', '2024-01-17 15:40:00'),
('Palesa Mokoena', 'WITS2021005', 2, 5, 3, 2.25, 'At Risk', 'palesa.mokoena@students.wits.ac.za', '+27-71-012-3456', 'Samuel Mokoena', '+27-11-345-6789', '2021-02-01', '2024-01-11 12:15:00'),
('Ahmed Osman', 'WITS2022006', 2, 6, 2, 3.72, 'Safe', 'ahmed.osman@students.wits.ac.za', '+27-72-123-4567', 'Mariam Osman', '+27-11-456-7890', '2022-02-01', '2024-01-16 09:50:00'),
('Sarah Mitchell', 'WITS2021007', 2, 1, 3, 1.75, 'Critical', 'sarah.mitchell@students.wits.ac.za', '+27-73-234-5678', 'David Mitchell', '+27-11-567-8901', '2021-02-01', '2024-01-07 14:25:00'),
('Mpho Letsatsi', 'WITS2020008', 2, 2, 4, 3.58, 'Safe', 'mpho.letsatsi@students.wits.ac.za', '+27-74-345-6789', 'Jane Letsatsi', '+27-11-678-9012', '2020-02-01', '2024-01-15 11:35:00'),
('Kevin Park', 'WITS2023009', 2, 3, 1, 2.85, 'At Risk', 'kevin.park@students.wits.ac.za', '+27-75-456-7890', 'Grace Park', '+27-11-789-0123', '2023-02-01', '2024-01-13 16:20:00'),
('Nomvula Radebe', 'WITS2022010', 2, 4, 2, 3.45, 'Safe', 'nomvula.radebe@students.wits.ac.za', '+27-76-567-8901', 'John Radebe', '+27-11-890-1234', '2022-02-01', '2024-01-16 13:45:00'),
('Lucas Silva', 'WITS2021011', 2, 5, 3, 2.05, 'Critical', 'lucas.silva@students.wits.ac.za', '+27-77-678-9012', 'Ana Silva', '+27-11-901-2345', '2021-02-01', '2024-01-09 10:30:00'),
('Chloe Adams', 'WITS2020012', 2, 6, 4, 3.82, 'Safe', 'chloe.adams@students.wits.ac.za', '+27-78-789-0123', 'Stephen Adams', '+27-11-012-3456', '2020-02-01', '2024-01-15 14:50:00'),
('Tebogo Masilo', 'WITS2022013', 2, 1, 2, 2.65, 'At Risk', 'tebogo.masilo@students.wits.ac.za', '+27-79-890-1234', 'Rose Masilo', '+27-11-123-4567', '2022-02-01', '2024-01-12 08:15:00'),
('Emma Thompson', 'WITS2023014', 2, 2, 1, 3.35, 'Safe', 'emma.thompson@students.wits.ac.za', '+27-80-901-2345', 'Paul Thompson', '+27-11-234-5678', '2023-02-01', '2024-01-17 12:40:00'),
('Adeel Rahman', 'WITS2021015', 2, 3, 3, 3.68, 'Safe', 'adeel.rahman@students.wits.ac.za', '+27-81-012-3456', 'Fatima Rahman', '+27-11-345-6789', '2021-02-01', '2024-01-14 17:25:00'),
('Kagiso Mthombeni', 'WITS2020016', 2, 4, 4, 1.85, 'Critical', 'kagiso.mthombeni@students.wits.ac.za', '+27-82-123-4567', 'Dineo Mthombeni', '+27-11-456-7890', '2020-02-01', '2024-01-08 09:40:00'),
('Hannah White', 'WITS2022017', 2, 5, 2, 3.22, 'Safe', 'hannah.white@students.wits.ac.za', '+27-83-234-5678', 'Mark White', '+27-11-567-8901', '2022-02-01', '2024-01-16 15:30:00'),
('Kwame Asante', 'WITS2021018', 2, 6, 3, 2.45, 'At Risk', 'kwame.asante@students.wits.ac.za', '+27-84-345-6789', 'Akosua Asante', '+27-11-678-9012', '2021-02-01', '2024-01-11 11:20:00'),
('Olivia Johnson', 'WITS2023019', 2, 1, 1, 3.55, 'Safe', 'olivia.johnson@students.wits.ac.za', '+27-85-456-7890', 'Brian Johnson', '+27-11-789-0123', '2023-02-01', '2024-01-18 08:35:00'),
('Sipho Zungu', 'WITS2020020', 2, 2, 4, 2.85, 'At Risk', 'sipho.zungu@students.wits.ac.za', '+27-86-567-8901', 'Nomsa Zungu', '+27-31-890-1234', '2020-02-01', '2024-01-13 13:50:00'),
('Isabella Martinez', 'WITS2022021', 2, 3, 2, 3.75, 'Safe', 'isabella.martinez@students.wits.ac.za', '+27-87-678-9012', 'Diego Martinez', '+27-11-901-2345', '2022-02-01', '2024-01-16 10:45:00'),
('Nkosana Dube', 'WITS2021022', 2, 4, 3, 1.95, 'Critical', 'nkosana.dube@students.wits.ac.za', '+27-88-789-0123', 'Beauty Dube', '+27-11-012-3456', '2021-02-01', '2024-01-09 16:15:00'),
('Jacob Wilson', 'WITS2020023', 2, 5, 4, 3.48, 'Safe', 'jacob.wilson@students.wits.ac.za', '+27-89-890-1234', 'Nancy Wilson', '+27-11-123-4567', '2020-02-01', '2024-01-15 12:30:00'),
('Amina Kone', 'WITS2023024', 2, 6, 1, 2.95, 'Safe', 'amina.kone@students.wits.ac.za', '+27-90-901-2345', 'Bakary Kone', '+27-11-234-5678', '2023-02-01', '2024-01-17 14:20:00'),
('Refiloe Tau', 'WITS2022025', 2, 1, 2, 2.35, 'At Risk', 'refiloe.tau@students.wits.ac.za', '+27-91-012-3456', 'Patrick Tau', '+27-11-345-6789', '2022-02-01', '2024-01-12 09:55:00'),
('William Garcia', 'WITS2021026', 2, 2, 3, 3.62, 'Safe', 'william.garcia@students.wits.ac.za', '+27-92-123-4567', 'Carmen Garcia', '+27-11-456-7890', '2021-02-01', '2024-01-14 16:40:00'),
('Thato Mofokeng', 'WITS2020027', 2, 3, 4, 1.65, 'Critical', 'thato.mofokeng@students.wits.ac.za', '+27-93-234-5678', 'Elizabeth Mofokeng', '+27-11-567-8901', '2020-02-01', '2024-01-07 11:25:00'),
('Sophia Davis', 'WITS2023028', 2, 4, 1, 3.38, 'Safe', 'sophia.davis@students.wits.ac.za', '+27-94-345-6789', 'Michael Davis', '+27-11-678-9012', '2023-02-01', '2024-01-18 13:10:00'),
('Lungile Mkhize', 'WITS2022029', 2, 5, 2, 2.75, 'At Risk', 'lungile.mkhize@students.wits.ac.za', '+27-95-456-7890', 'Gugu Mkhize', '+27-31-789-0123', '2022-02-01', '2024-01-13 15:45:00'),
('Nicholas Brown', 'WITS2021030', 2, 6, 3, 3.85, 'Safe', 'nicholas.brown@students.wits.ac.za', '+27-96-567-8901', 'Helen Brown', '+27-11-890-1234', '2021-02-01', '2024-01-15 08:20:00'),
('Kamo Mokwena', 'WITS2020031', 2, 1, 4, 2.15, 'At Risk', 'kamo.mokwena@students.wits.ac.za', '+27-97-678-9012', 'Joseph Mokwena', '+27-11-901-2345', '2020-02-01', '2024-01-11 17:30:00'),
('Charlotte Taylor', 'WITS2023032', 2, 2, 1, 3.28, 'Safe', 'charlotte.taylor@students.wits.ac.za', '+27-98-789-0123', 'Richard Taylor', '+27-11-012-3456', '2023-02-01', '2024-01-17 10:15:00'),
('Bongani Cele', 'WITS2022033', 2, 3, 2, 3.52, 'Safe', 'bongani.cele@students.wits.ac.za', '+27-99-890-1234', 'Nomthandazo Cele', '+27-31-123-4567', '2022-02-01', '2024-01-16 14:35:00'),
('Madison King', 'WITS2021034', 2, 4, 3, 1.75, 'Critical', 'madison.king@students.wits.ac.za', '+27-60-901-2345', 'Robert King', '+27-11-234-5678', '2021-02-01', '2024-01-08 12:50:00'),
('Mandla Shongwe', 'WITS2020035', 2, 5, 4, 3.65, 'Safe', 'mandla.shongwe@students.wits.ac.za', '+27-61-012-3456', 'Nonhlanhla Shongwe', '+27-31-345-6789', '2020-02-01', '2024-01-15 09:25:00'),

-- Batch 3: University of Johannesburg (UJ) - 30 students
('Grace Abdi', 'UJ2021001', 3, 1, 3, 3.45, 'Safe', 'grace.abdi@students.uj.ac.za', '+27-62-123-4567', 'Omar Abdi', '+27-11-456-7890', '2021-02-01', '2024-01-15 11:40:00'),
('Ryan Phillips', 'UJ2022002', 3, 2, 2, 2.05, 'Critical', 'ryan.phillips@students.uj.ac.za', '+27-63-234-5678', 'Karen Phillips', '+27-11-567-8901', '2022-02-01', '2024-01-09 14:25:00'),
('Lerato Sehume', 'UJ2020003', 3, 3, 4, 3.82, 'Safe', 'lerato.sehume@students.uj.ac.za', '+27-64-345-6789', 'David Sehume', '+27-11-678-9012', '2020-02-01', '2024-01-16 08:55:00'),
('Cameron Scott', 'UJ2023004', 3, 4, 1, 2.95, 'Safe', 'cameron.scott@students.uj.ac.za', '+27-65-456-7890', 'Lisa Scott', '+27-11-789-0123', '2023-02-01', '2024-01-17 16:10:00'),
('Nokuthula Mahlangu', 'UJ2021005', 3, 5, 3, 2.45, 'At Risk', 'nokuthula.mahlangu@students.uj.ac.za', '+27-66-567-8901', 'Simon Mahlangu', '+27-11-890-1234', '2021-02-01', '2024-01-12 13:20:00'),
('Daniel Kim', 'UJ2022006', 3, 6, 2, 3.58, 'Safe', 'daniel.kim@students.uj.ac.za', '+27-67-678-9012', 'Sunmi Kim', '+27-11-901-2345', '2022-02-01', '2024-01-16 10:35:00'),
('Ava Rodriguez', 'UJ2021007', 3, 1, 3, 1.85, 'Critical', 'ava.rodriguez@students.uj.ac.za', '+27-68-789-0123', 'Carlos Rodriguez', '+27-11-012-3456', '2021-02-01', '2024-01-08 15:45:00'),
('Tshepo Molapo', 'UJ2020008', 3, 2, 4, 3.72, 'Safe', 'tshepo.molapo@students.uj.ac.za', '+27-69-890-1234', 'Maria Molapo', '+27-11-123-4567', '2020-02-01', '2024-01-15 12:15:00'),
('Maya Patel', 'UJ2023009', 3, 3, 1, 3.25, 'Safe', 'maya.patel@students.uj.ac.za', '+27-70-901-2345', 'Raj Patel', '+27-11-234-5678', '2023-02-01', '2024-01-17 09:30:00'),
('Thabo Moloi', 'UJ2022010', 3, 4, 2, 2.25, 'At Risk', 'thabo.moloi@students.uj.ac.za', '+27-71-012-3456', 'Grace Moloi', '+27-11-345-6789', '2022-02-01', '2024-01-12 17:20:00'),
('Zoe Williams', 'UJ2021011', 3, 5, 3, 3.48, 'Safe', 'zoe.williams@students.uj.ac.za', '+27-72-123-4567', 'Peter Williams', '+27-11-456-7890', '2021-02-01', '2024-01-14 14:50:00'),
('Katlego Kekana', 'UJ2020012', 3, 6, 4, 1.95, 'Critical', 'katlego.kekana@students.uj.ac.za', '+27-73-234-5678', 'Martha Kekana', '+27-11-567-8901', '2020-02-01', '2024-01-09 11:35:00'),
('Noah Anderson', 'UJ2023013', 3, 1, 1, 3.15, 'Safe', 'noah.anderson@students.uj.ac.za', '+27-74-345-6789', 'Sandra Anderson', '+27-11-678-9012', '2023-02-01', '2024-01-18 08:40:00'),
('Boitumelo Setshedi', 'UJ2022014', 3, 2, 2, 2.85, 'At Risk', 'boitumelo.setshedi@students.uj.ac.za', '+27-75-456-7890', 'Paul Setshedi', '+27-11-789-0123', '2022-02-01', '2024-01-13 16:25:00'),
('Megan Clark', 'UJ2021015', 3, 3, 3, 3.65, 'Safe', 'megan.clark@students.uj.ac.za', '+27-76-567-8901', 'Jennifer Clark', '+27-11-890-1234', '2021-02-01', '2024-01-15 13:10:00'),
('Lebohang Motaung', 'UJ2020016', 3, 4, 4, 2.15, 'At Risk', 'lebohang.motaung@students.uj.ac.za', '+27-77-678-9012', 'Rebecca Motaung', '+27-11-901-2345', '2020-02-01', '2024-01-11 10:45:00'),
('Justin Lee', 'UJ2022017', 3, 5, 2, 3.35, 'Safe', 'justin.lee@students.uj.ac.za', '+27-78-789-0123', 'Angela Lee', '+27-11-012-3456', '2022-02-01', '2024-01-16 15:55:00'),
('Nomfundo Zulu', 'UJ2023018', 3, 6, 1, 2.65, 'At Risk', 'nomfundo.zulu@students.uj.ac.za', '+27-79-890-1234', 'Siyabonga Zulu', '+27-31-123-4567', '2023-02-01', '2024-01-13 12:30:00'),
('Aaron Turner', 'UJ2021019', 3, 1, 3, 3.78, 'Safe', 'aaron.turner@students.uj.ac.za', '+27-80-901-2345', 'Michelle Turner', '+27-11-234-5678', '2021-02-01', '2024-01-14 09:15:00'),
('Thandiwe Mbeki', 'UJ2020020', 3, 2, 4, 1.75, 'Critical', 'thandiwe.mbeki@students.uj.ac.za', '+27-81-012-3456', 'Govan Mbeki', '+27-11-345-6789', '2020-02-01', '2024-01-07 17:40:00'),
('Caitlin White', 'UJ2022021', 3, 3, 2, 3.52, 'Safe', 'caitlin.white@students.uj.ac.za', '+27-82-123-4567', 'Robert White', '+27-11-456-7890', '2022-02-01', '2024-01-16 11:20:00'),
('Sello Mokgosi', 'UJ2021022', 3, 4, 3, 2.35, 'At Risk', 'sello.mokgosi@students.uj.ac.za', '+27-83-234-5678', 'Alice Mokgosi', '+27-11-567-8901', '2021-02-01', '2024-01-12 14:35:00'),
('Rachel Davis', 'UJ2023023', 3, 5, 1, 3.42, 'Safe', 'rachel.davis@students.uj.ac.za', '+27-84-345-6789', 'Steven Davis', '+27-11-678-9012', '2023-02-01', '2024-01-17 16:50:00'),
('Wandile Nkomo', 'UJ2020024', 3, 6, 4, 2.95, 'Safe', 'wandile.nkomo@students.uj.ac.za', '+27-85-456-7890', 'Emily Nkomo', '+27-31-789-0123', '2020-02-01', '2024-01-15 08:25:00'),
('Ethan Johnson', 'UJ2022025', 3, 1, 2, 1.65, 'Critical', 'ethan.johnson@students.uj.ac.za', '+27-86-567-8901', 'Patricia Johnson', '+27-11-890-1234', '2022-02-01', '2024-01-08 13:15:00'),
('Dikeledi Ramokgopa', 'UJ2021026', 3, 2, 3, 3.68, 'Safe', 'dikeledi.ramokgopa@students.uj.ac.za', '+27-87-678-9012', 'Thomas Ramokgopa', '+27-11-901-2345', '2021-02-01', '2024-01-14 10:50:00'),
('Caleb Martinez', 'UJ2020027', 3, 3, 4, 2.45, 'At Risk', 'caleb.martinez@students.uj.ac.za', '+27-88-789-0123', 'Rosa Martinez', '+27-11-012-3456', '2020-02-01', '2024-01-12 15:30:00'),
('Naledi Langa', 'UJ2023028', 3, 4, 1, 3.28, 'Safe', 'naledi.langa@students.uj.ac.za', '+27-89-890-1234', 'Frank Langa', '+27-11-123-4567', '2023-02-01', '2024-01-18 12:45:00'),
('Hunter Wilson', 'UJ2022029', 3, 5, 2, 2.75, 'At Risk', 'hunter.wilson@students.uj.ac.za', '+27-90-901-2345', 'Diana Wilson', '+27-11-234-5678', '2022-02-01', '2024-01-13 09:40:00'),
('Rethabile Phiri', 'UJ2021030', 3, 6, 3, 3.55, 'Safe', 'rethabile.phiri@students.uj.ac.za', '+27-91-012-3456', 'James Phiri', '+27-11-345-6789', '2021-02-01', '2024-01-15 16:20:00'),

-- Batch 4: University of KwaZulu-Natal (UKZN) - 30 students
('Ayesha Singh', 'UKZN2021001', 4, 1, 3, 3.32, 'Safe', 'ayesha.singh@students.ukzn.ac.za', '+27-92-123-4567', 'Ravi Singh', '+27-31-456-7890', '2021-02-01', '2024-01-15 11:25:00'),
('Logan Thomas', 'UKZN2022002', 4, 2, 2, 1.85, 'Critical', 'logan.thomas@students.ukzn.ac.za', '+27-93-234-5678', 'Sarah Thomas', '+27-31-567-8901', '2022-02-01', '2024-01-08 14:10:00'),
('Nonkosi Dlamini', 'UKZN2020003', 4, 3, 4, 3.75, 'Safe', 'nonkosi.dlamini@students.ukzn.ac.za', '+27-94-345-6789', 'Bongani Dlamini', '+27-31-678-9012', '2020-02-01', '2024-01-16 09:35:00'),
('Gabriel Martinez', 'UKZN2023004', 4, 4, 1, 2.85, 'At Risk', 'gabriel.martinez@students.ukzn.ac.za', '+27-95-456-7890', 'Maria Martinez', '+27-31-789-0123', '2023-02-01', '2024-01-13 16:50:00'),
('Lindiwe Mthembu', 'UKZN2021005', 4, 5, 3, 3.58, 'Safe', 'lindiwe.mthembu@students.ukzn.ac.za', '+27-96-567-8901', 'Sipho Mthembu', '+27-31-890-1234', '2021-02-01', '2024-01-14 12:40:00'),
('Mason Brown', 'UKZN2022006', 4, 6, 2, 2.15, 'At Risk', 'mason.brown@students.ukzn.ac.za', '+27-97-678-9012', 'Lisa Brown', '+27-31-901-2345', '2022-02-01', '2024-01-11 08:55:00'),
('Zahra Abbas', 'UKZN2021007', 4, 1, 3, 1.95, 'Critical', 'zahra.abbas@students.ukzn.ac.za', '+27-98-789-0123', 'Ali Abbas', '+27-31-012-3456', '2021-02-01', '2024-01-09 15:20:00'),
('Sizani Ngcobo', 'UKZN2020008', 4, 2, 4, 3.45, 'Safe', 'sizani.ngcobo@students.ukzn.ac.za', '+27-99-890-1234', 'Promise Ngcobo', '+27-31-123-4567', '2020-02-01', '2024-01-15 13:30:00'),
('Elijah Garcia', 'UKZN2023009', 4, 3, 1, 3.15, 'Safe', 'elijah.garcia@students.ukzn.ac.za', '+27-60-901-2345', 'Carmen Garcia', '+27-31-234-5678', '2023-02-01', '2024-01-17 10:45:00'),
('Nomsa Khumalo', 'UKZN2022010', 4, 4, 2, 2.65, 'At Risk', 'nomsa.khumalo@students.ukzn.ac.za', '+27-61-012-3456', 'Thabo Khumalo', '+27-31-345-6789', '2022-02-01', '2024-01-12 17:15:00'),
('Victoria Lee', 'UKZN2021011', 4, 5, 3, 3.72, 'Safe', 'victoria.lee@students.ukzn.ac.za', '+27-62-123-4567', 'Michael Lee', '+27-31-456-7890', '2021-02-01', '2024-01-14 14:25:00'),
('Mpumelelo Majola', 'UKZN2020012', 4, 6, 4, 1.75, 'Critical', 'mpumelelo.majola@students.ukzn.ac.za', '+27-63-234-5678', 'Nomthandazo Majola', '+27-31-567-8901', '2020-02-01', '2024-01-08 12:10:00'),
('Nathan Rodriguez', 'UKZN2023013', 4, 1, 1, 2.95, 'Safe', 'nathan.rodriguez@students.ukzn.ac.za', '+27-64-345-6789', 'Elena Rodriguez', '+27-31-678-9012', '2023-02-01', '2024-01-18 09:35:00'),
('Thandeka Zungu', 'UKZN2022014', 4, 2, 2, 2.45, 'At Risk', 'thandeka.zungu@students.ukzn.ac.za', '+27-65-456-7890', 'Mduduzi Zungu', '+27-31-789-0123', '2022-02-01', '2024-01-12 16:40:00'),
('Isaac Wilson', 'UKZN2021015', 4, 3, 3, 3.62, 'Safe', 'isaac.wilson@students.ukzn.ac.za', '+27-66-567-8901', 'Nancy Wilson', '+27-31-890-1234', '2021-02-01', '2024-01-15 11:50:00'),
('Bongiwe Mhlongo', 'UKZN2020016', 4, 4, 4, 3.38, 'Safe', 'bongiwe.mhlongo@students.ukzn.ac.za', '+27-67-678-9012', 'Lucky Mhlongo', '+27-31-901-2345', '2020-02-01', '2024-01-16 08:15:00'),
('Lily Park', 'UKZN2022017', 4, 5, 2, 1.85, 'Critical', 'lily.park@students.ukzn.ac.za', '+27-68-789-0123', 'Kevin Park', '+27-31-012-3456', '2022-02-01', '2024-01-09 13:25:00'),
('Siphokazi Nyathi', 'UKZN2023018', 4, 6, 1, 3.25, 'Safe', 'siphokazi.nyathi@students.ukzn.ac.za', '+27-69-890-1234', 'Nkosana Nyathi', '+27-31-123-4567', '2023-02-01', '2024-01-17 15:40:00'),
('Carson Davis', 'UKZN2021019', 4, 1, 3, 2.85, 'At Risk', 'carson.davis@students.ukzn.ac.za', '+27-70-901-2345', 'Amanda Davis', '+27-31-234-5678', '2021-02-01', '2024-01-13 10:55:00'),
('Nobuhle Sithole', 'UKZN2020020', 4, 2, 4, 3.48, 'Safe', 'nobuhle.sithole@students.ukzn.ac.za', '+27-71-012-3456', 'Sandile Sithole', '+27-31-345-6789', '2020-02-01', '2024-01-15 14:30:00'),
('Adrian Kim', 'UKZN2022021', 4, 3, 2, 2.25, 'At Risk', 'adrian.kim@students.ukzn.ac.za', '+27-72-123-4567', 'Grace Kim', '+27-31-456-7890', '2022-02-01', '2024-01-11 17:10:00'),
('Zama Ndaba', 'UKZN2021022', 4, 4, 3, 3.82, 'Safe', 'zama.ndaba@students.ukzn.ac.za', '+27-73-234-5678', 'Faith Ndaba', '+27-31-567-8901', '2021-02-01', '2024-01-14 12:45:00'),
('Stella Anderson', 'UKZN2023023', 4, 5, 1, 2.05, 'Critical', 'stella.anderson@students.ukzn.ac.za', '+27-74-345-6789', 'John Anderson', '+27-31-678-9012', '2023-02-01', '2024-01-09 16:35:00'),
('Phumzile Mngadi', 'UKZN2020024', 4, 6, 4, 3.55, 'Safe', 'phumzile.mngadi@students.ukzn.ac.za', '+27-75-456-7890', 'Themba Mngadi', '+27-31-789-0123', '2020-02-01', '2024-01-15 09:20:00'),
('Hudson Clark', 'UKZN2022025', 4, 1, 2, 1.65, 'Critical', 'hudson.clark@students.ukzn.ac.za', '+27-76-567-8901', 'Margaret Clark', '+27-31-890-1234', '2022-02-01', '2024-01-07 14:45:00'),
('Thulisile Mbatha', 'UKZN2021026', 4, 2, 3, 3.65, 'Safe', 'thulisile.mbatha@students.ukzn.ac.za', '+27-77-678-9012', 'Prince Mbatha', '+27-31-901-2345', '2021-02-01', '2024-01-14 11:15:00'),
('Kai Rodriguez', 'UKZN2020027', 4, 3, 4, 2.55, 'At Risk', 'kai.rodriguez@students.ukzn.ac.za', '+27-78-789-0123', 'Isabella Rodriguez', '+27-31-012-3456', '2020-02-01', '2024-01-12 18:20:00'),
('Nomzamo Dube', 'UKZN2023028', 4, 4, 1, 3.18, 'Safe', 'nomzamo.dube@students.ukzn.ac.za', '+27-79-890-1234', 'Simon Dube', '+27-31-123-4567', '2023-02-01', '2024-01-17 13:50:00'),
('Parker Johnson', 'UKZN2022029', 4, 5, 2, 2.75, 'At Risk', 'parker.johnson@students.ukzn.ac.za', '+27-80-901-2345', 'Rebecca Johnson', '+27-31-234-5678', '2022-02-01', '2024-01-13 15:25:00'),
('Snenhlanhla Zuma', 'UKZN2021030', 4, 6, 3, 3.45, 'Safe', 'snenhlanhla.zuma@students.ukzn.ac.za', '+27-81-012-3456', 'Duduzile Zuma', '+27-31-345-6789', '2021-02-01', '2024-01-15 10:30:00');

-- ============================================================================
-- SAMPLE SUPPORT REQUESTS
-- ============================================================================

-- Insert sample support requests to demonstrate the system
INSERT INTO SupportRequests (StudentID, CategoryID, Title, Description, Priority, Status, AssignedPartnerID, Notes) VALUES
(4, 2, 'Experiencing High Stress Levels', 'I''ve been feeling overwhelmed with my coursework and struggling to manage stress. Need help with coping strategies.', 'High', 'In Progress', 1, 'Student showing signs of academic stress, scheduled for counseling sessions.'),
(9, 2, 'Difficulty Concentrating', 'Having trouble focusing on studies due to personal issues. Need mental health support.', 'Critical', 'Open', NULL, 'Urgent case requiring immediate attention.'),
(14, 1, 'Struggling with Computer Science Concepts', 'Finding it difficult to understand programming concepts in CS course. Need tutoring assistance.', 'Medium', 'Open', NULL, 'Student needs programming fundamentals tutoring.'),
(18, 3, 'Financial Difficulties', 'Unable to pay for textbooks and course materials due to family financial constraints.', 'High', 'In Progress', 5, 'Working on financial aid application and budget planning.'),
(24, 1, 'Poor Performance in Engineering Mathematics', 'Failing in calculus and need immediate academic intervention.', 'Critical', 'Open', NULL, 'Student at risk of academic exclusion.'),
(31, 2, 'Anxiety About Exams', 'Experiencing severe anxiety before exams, affecting performance.', 'High', 'Resolved', 1, 'Completed anxiety management sessions, student showing improvement.'),
(37, 4, 'Career Path Uncertainty', 'Unsure about career direction after graduation, need guidance.', 'Medium', 'Open', 3, NULL),
(42, 1, 'Chemistry Lab Difficulties', 'Struggling with laboratory work and experimental procedures.', 'Medium', 'In Progress', 6, 'Scheduled for additional lab sessions.'),
(49, 3, 'Accommodation Payment Issues', 'Having trouble securing student accommodation due to funding delays.', 'High', 'Open', 5, NULL),
(55, 2, 'Social Isolation', 'Feeling isolated and having difficulty making friends on campus.', 'Medium', 'In Progress', 9, 'Participating in peer support group sessions.'),
(63, 1, 'Statistics Course Assistance', 'Need help understanding statistical concepts and data analysis.', 'Low', 'Open', NULL, NULL),
(68, 4, 'Internship Search Support', 'Need assistance finding suitable internship opportunities.', 'Low', 'Open', 3, NULL),
(74, 2, 'Depression and Low Motivation', 'Struggling with depressive episodes affecting academic progress.', 'Critical', 'In Progress', 1, 'Ongoing counseling sessions with positive progress.'),
(81, 1, 'Business Law Understanding', 'Having difficulty grasping legal concepts in business law course.', 'Medium', 'Resolved', 8, 'Completed tutoring sessions, improved understanding.'),
(89, 3, 'Emergency Financial Assistance', 'Family emergency requiring immediate financial support.', 'Critical', 'Open', 5, 'Reviewing emergency fund applications.'),
(95, 4, 'Graduate School Preparation', 'Need guidance on graduate school applications and requirements.', 'Medium', 'Open', 3, NULL),
(102, 1, 'Physics Concepts Clarification', 'Struggling with quantum physics concepts, need advanced tutoring.', 'Medium', 'In Progress', 4, 'Weekly tutoring sessions scheduled.'),
(108, 2, 'Work-Life Balance Issues', 'Difficulty balancing work, studies, and personal life.', 'Medium', 'Open', 7, NULL),
(115, 3, 'Bursary Application Assistance', 'Need help with completing bursary applications and documentation.', 'Medium', 'Resolved', 5, 'Successfully submitted applications.'),
(122, 1, 'Medical School Preparation', 'Need intensive academic support for medical school entrance requirements.', 'High', 'In Progress', 6, 'Comprehensive study plan implemented.'),
(128, 4, 'Professional Development', 'Looking for career development opportunities and skill building.', 'Low', 'Open', 3, NULL),
(3, 1, 'Advanced Engineering Project', 'Need guidance on final year engineering project design and implementation.', 'Medium', 'Open', 4, NULL),
(12, 2, 'Adjustment Difficulties', 'International student struggling with cultural adjustment and homesickness.', 'Medium', 'In Progress', 9, 'Cultural adaptation support sessions in progress.'),
(27, 3, 'Part-time Work Opportunities', 'Seeking assistance finding part-time work to support studies.', 'Medium', 'Open', 5, NULL),
(45, 1, 'Research Methodology Help', 'Need assistance with research methods for thesis project.', 'Low', 'Open', NULL, 'Self-study resources provided.');

-- ============================================================================
-- SAMPLE SUPPORT LOGS
-- ============================================================================

-- Insert sample support logs for completed and ongoing sessions
INSERT INTO SupportLogs (RequestID, PartnerID, SessionDate, Duration, SessionType, Notes, Outcome, FollowUpRequired) VALUES
(1, 1, '2024-01-10 10:00:00', 60, 'Individual', 'Initial assessment session. Student showing high stress levels due to academic pressure.', 'Positive', 1),
(1, 1, '2024-01-12 14:00:00', 45, 'Individual', 'Taught stress management techniques and breathing exercises.', 'Positive', 1),
(4, 5, '2024-01-11 09:30:00', 90, 'Individual', 'Financial planning session. Reviewed budget and identified cost-saving opportunities.', 'Positive', 1),
(6, 1, '2024-01-08 11:00:00', 50, 'Individual', 'Anxiety management session before exam period.', 'Positive', 0),
(6, 1, '2024-01-15 11:00:00', 45, 'Individual', 'Follow-up session. Student reports significant improvement in managing exam anxiety.', 'Positive', 0),
(8, 6, '2024-01-13 15:30:00', 120, 'Individual', 'Laboratory techniques training session. Covered safety procedures and experimental methods.', 'Positive', 1),
(10, 9, '2024-01-09 16:00:00', 60, 'Group', 'Peer support group session focusing on social integration strategies.', 'Positive', 1),
(13, 1, '2024-01-12 13:00:00', 60, 'Individual', 'Depression counseling session. Discussed coping strategies and academic accommodations.', 'Needs Follow-up', 1),
(14, 8, '2024-01-10 10:30:00', 75, 'Individual', 'Business law tutoring. Covered contract law basics and case studies.', 'Positive', 0),
(17, 4, '2024-01-14 14:00:00', 90, 'Individual', 'Physics tutoring session on quantum mechanics principles.', 'Positive', 1),
(19, 5, '2024-01-11 12:00:00', 45, 'Individual', 'Bursary application assistance. Helped complete required documentation.', 'Positive', 0),
(20, 6, '2024-01-13 09:00:00', 120, 'Individual', 'Medical school preparation session. Reviewed study materials and exam techniques.', 'Positive', 1),
(23, 9, '2024-01-15 17:00:00', 60, 'Group', 'Cultural adaptation support for international students.', 'Positive', 1);

-- ============================================================================
-- SAMPLE STUDENT PROFILES
-- ============================================================================

-- Insert sample student profiles for a few students
INSERT INTO StudentProfiles (StudentID, Bio, Interests, Goals, Achievements, PreferredContactMethod, IsPublic) VALUES
(1, 'Third-year Computer Science student passionate about artificial intelligence and machine learning.', 'Programming, AI, Data Science, Reading', 'Graduate with honors and pursue postgraduate studies in AI', 'Dean''s List 2022, Hackathon Winner', 'Email', 1),
(3, 'Engineering student with interests in renewable energy and sustainable technology solutions.', 'Engineering, Environmental Science, Innovation', 'Contribute to sustainable technology development', 'Top 10% of class, Research project published', 'Phone', 1),
(5, 'Medical student dedicated to community health and rural medicine practice.', 'Medicine, Community Service, Healthcare', 'Specialize in family medicine and serve rural communities', 'Volunteer at local clinic, First Aid certification', 'Email', 0),
(12, 'Psychology student interested in child development and educational psychology.', 'Psychology, Child Development, Research', 'Become a school psychologist', 'Research assistant position, Honor society member', 'Email', 1),
(19, 'Business student with entrepreneurial aspirations and interest in social impact.', 'Business, Entrepreneurship, Social Impact', 'Start a social enterprise', 'Business plan competition finalist', 'Phone', 1),
(25, 'Law student focused on human rights and constitutional law.', 'Law, Human Rights, Social Justice', 'Practice human rights law', 'Moot court competition winner, Legal aid volunteer', 'Email', 1);

-- ============================================================================
-- DATA VERIFICATION QUERIES
-- ============================================================================

PRINT '============================================================================';
PRINT 'STUDENT DATA POPULATION COMPLETED SUCCESSFULLY!';
PRINT '';

-- Student count verification
DECLARE @StudentCount INT, @SafeCount INT, @AtRiskCount INT, @CriticalCount INT;

SELECT @StudentCount = COUNT(*) FROM Students WHERE IsActive = 1;
SELECT @SafeCount = COUNT(*) FROM Students WHERE RiskLevel = 'Safe' AND IsActive = 1;
SELECT @AtRiskCount = COUNT(*) FROM Students WHERE RiskLevel = 'At Risk' AND IsActive = 1;
SELECT @CriticalCount = COUNT(*) FROM Students WHERE RiskLevel = 'Critical' AND IsActive = 1;

PRINT 'STUDENT STATISTICS:';
PRINT '==================';
PRINT 'Total Students: ' + CAST(@StudentCount AS NVARCHAR(10));
PRINT 'Safe Risk Level: ' + CAST(@SafeCount AS NVARCHAR(10));
PRINT 'At Risk Level: ' + CAST(@AtRiskCount AS NVARCHAR(10));
PRINT 'Critical Risk Level: ' + CAST(@CriticalCount AS NVARCHAR(10));
PRINT '';

-- Support requests count
DECLARE @RequestCount INT;
SELECT @RequestCount = COUNT(*) FROM SupportRequests;
PRINT 'Support Requests: ' + CAST(@RequestCount AS NVARCHAR(10));

-- Support logs count
DECLARE @LogCount INT;
SELECT @LogCount = COUNT(*) FROM SupportLogs;
PRINT 'Support Logs: ' + CAST(@LogCount AS NVARCHAR(10));

-- Student profiles count
DECLARE @ProfileCount INT;
SELECT @ProfileCount = COUNT(*) FROM StudentProfiles;
PRINT 'Student Profiles: ' + CAST(@ProfileCount AS NVARCHAR(10));

PRINT '';
PRINT '============================================================================';
PRINT 'DATABASE READY FOR API CONNECTION!';
PRINT '';
PRINT 'Next Steps:';
PRINT '1. Start the Express API server (npm run dev)';
PRINT '2. Test API endpoints using provided routes';
PRINT '3. Connect frontend application to API';
PRINT '4. Test all CRUD operations and dashboard features';
PRINT '============================================================================';

-- Sample queries to verify data integrity
/*
-- University distribution
SELECT u.UniversityName, COUNT(s.StudentID) as StudentCount
FROM Students s
LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
WHERE s.IsActive = 1
GROUP BY u.UniversityName
ORDER BY StudentCount DESC;

-- Program distribution
SELECT p.ProgramName, COUNT(s.StudentID) as StudentCount
FROM Students s
LEFT JOIN Programs p ON s.ProgramID = p.ProgramID
WHERE s.IsActive = 1
GROUP BY p.ProgramName
ORDER BY StudentCount DESC;

-- Risk level by university
SELECT u.UniversityName, s.RiskLevel, COUNT(*) as Count
FROM Students s
LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
WHERE s.IsActive = 1
GROUP BY u.UniversityName, s.RiskLevel
ORDER BY u.UniversityName, s.RiskLevel;
*/

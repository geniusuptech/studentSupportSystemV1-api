-- Seed Students for D1
INSERT INTO Students (StudentName, StudentNumber, UniversityID, ProgramID, YearOfStudy, GPA, RiskLevel, ContactEmail, ContactPhone, EmergencyContact, EmergencyPhone, DateEnrolled, LastLoginDate) VALUES
('Aisha Patel', 'UCT2021001', 1, 1, 3, 3.85, 'Safe', 'aisha.patel@students.uct.ac.za', '+27-72-123-4567', 'Ravi Patel', '+27-21-456-7890', '2021-02-01', '2024-01-15 09:30:00'),
('Marcus Thompson', 'UCT2021002', 1, 2, 3, 2.15, 'At Risk', 'marcus.thompson@students.uct.ac.za', '+27-73-234-5678', 'Sarah Thompson', '+27-21-567-8901', '2021-02-01', '2024-01-10 14:20:00'),
('Zara Mohamed', 'UCT2020003', 1, 3, 4, 3.92, 'Safe', 'zara.mohamed@students.uct.ac.za', '+27-74-345-6789', 'Ahmed Mohamed', '+27-21-678-9012', '2020-02-01', '2024-01-16 11:45:00'),
('Connor Williams', 'UCT2022004', 1, 1, 2, 1.85, 'Critical', 'connor.williams@students.uct.ac.za', '+27-75-456-7890', 'Linda Williams', '+27-21-789-0123', '2022-02-01', '2024-01-08 16:15:00'),
('Lerato Khumalo', 'UCT2021021', 1, 1, 3, 3.58, 'Safe', 'lerato.khumalo@students.uct.ac.za', '+27-92-123-4567', 'Thabo Khumalo', '+27-31-456-7890', '2021-02-01', '2024-01-16 16:45:00'),
('Matthew Brown', 'WITS2022026', 2, 1, 2, 2.75, 'At Risk', 'matthew.brown@students.wits.ac.za', '+27-97-678-9012', 'Susan Brown', '+27-21-901-2345', '2022-02-01', '2024-01-13 14:20:00'),
('Zoe Williams', 'UJ2021011', 3, 5, 3, 3.48, 'Safe', 'zoe.williams@students.uj.ac.za', '+27-72-123-4567', 'Peter Williams', '+27-11-456-7890', '2021-02-01', '2024-01-14 14:50:00'),
('Logan Thomas', 'UKZN2022002', 4, 2, 2, 1.85, 'Critical', 'logan.thomas@students.ukzn.ac.za', '+27-93-234-5678', 'Sarah Thomas', '+27-31-567-8901', '2022-02-01', '2024-01-08 14:10:00');

-- Seed some support requests
INSERT INTO SupportRequests (StudentID, CategoryID, Title, Description, Priority, Status, Notes) VALUES
(4, 2, 'Experiencing High Stress Levels', 'I’ve been feeling overwhelmed with my coursework.', 'High', 'Open', 'Initial request'),
(2, 1, 'Math Tutoring Needed', 'Struggling with Calculus II.', 'Medium', 'In Progress', 'Assigned to tutor');

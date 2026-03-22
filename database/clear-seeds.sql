PRAGMA foreign_keys = OFF;

-- Delete data starting from child tables to parent tables
DELETE FROM SupportLogs;
DELETE FROM SupportRequests;
DELETE FROM StudentProfiles;
DELETE FROM Messages;
DELETE FROM Users;

-- Stakeholder Tables
DELETE FROM Students;
DELETE FROM Coordinators;
DELETE FROM Partners;

-- Master Tables
DELETE FROM SupportRequestCategories;
DELETE FROM Programs;
DELETE FROM Universities;

-- Reset Auto-Increment Counters
DELETE FROM sqlite_sequence;

PRAGMA foreign_keys = ON;


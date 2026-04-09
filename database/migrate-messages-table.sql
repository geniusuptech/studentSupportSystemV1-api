-- Migration: Update Messages table schema
-- This migration adds missing columns to the Messages table if they don't exist

-- First, backup existing messages (if any)
CREATE TABLE IF NOT EXISTS Messages_Backup AS SELECT * FROM Messages;

-- Drop the old Messages table
DROP TABLE IF EXISTS Messages;

-- Create the corrected Messages table
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

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON Messages(RecipientID, RecipientType);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON Messages(SenderID, SenderType);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON Messages(SenderID, SenderType, RecipientID, RecipientType);

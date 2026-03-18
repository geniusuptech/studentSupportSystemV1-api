-- ============================================================================
-- Messages Table Creation Script
-- ============================================================================
-- SQL Server Script to create the Messages table for the Student Wellness Dashboard
-- ============================================================================

USE StudentWellnessDB;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Messages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Messages] (
        [MessageID]         INT IDENTITY(1,1) PRIMARY KEY,
        [Sender]            NVARCHAR(20) NOT NULL, -- 'student', 'coordinator', 'partner'
        [MessageText]       NVARCHAR(MAX),
        [MessageTime]       NVARCHAR(20), -- e.g. '10:30 AM'
        [IsRead]            BIT DEFAULT 0,
        [AttachmentURL]     NVARCHAR(500),
        [FileName]          NVARCHAR(255),
        [FileType]          NVARCHAR(50),
        [FileSize]          INT,
        [StudentID]         INT,
        [CoordinatorID]     INT,
        [PartnerID]         INT,
        [CreatedAt]         DATETIME2 DEFAULT GETDATE(),
        
        -- Foreign Key Constraints
        CONSTRAINT FK_Messages_Student FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
        CONSTRAINT FK_Messages_Coordinator FOREIGN KEY (CoordinatorID) REFERENCES Coordinators(CoordinatorID),
        CONSTRAINT FK_Messages_Partner FOREIGN KEY (PartnerID) REFERENCES Partners(PartnerID)
    );

    -- Create common indexes
    CREATE INDEX IX_Messages_Thread ON Messages(StudentID, CoordinatorID, PartnerID);
    CREATE INDEX IX_Messages_CreatedAt ON Messages(CreatedAt);

    PRINT 'Messages table created successfully.';
END
ELSE
BEGIN
    PRINT 'Messages table already exists.';
END
GO

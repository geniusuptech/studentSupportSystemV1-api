-- Interventions Table for tracking student interventions
-- Run this script to create the Interventions table

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Interventions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Interventions] (
        [InterventionID] INT IDENTITY(1,1) PRIMARY KEY,
        [StudentID] INT NOT NULL,
        [InterventionType] NVARCHAR(100) NOT NULL, -- e.g., 'Academic Support', 'Counseling', 'Peer Mentorship'
        [Description] NVARCHAR(MAX) NULL,
        [Status] NVARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'Completed', 'Cancelled'
        [Priority] NVARCHAR(20) NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
        [AssignedTo] NVARCHAR(255) NULL, -- Coordinator or staff name
        [Notes] NVARCHAR(MAX) NULL,
        [StartDate] DATETIME NOT NULL DEFAULT GETDATE(),
        [EndDate] DATETIME NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT [FK_Interventions_Students] FOREIGN KEY ([StudentID]) 
            REFERENCES [dbo].[Students]([StudentID]) ON DELETE CASCADE
    );
    
    -- Create indexes for faster lookups
    CREATE NONCLUSTERED INDEX [IX_Interventions_StudentID] ON [dbo].[Interventions]([StudentID]);
    CREATE NONCLUSTERED INDEX [IX_Interventions_Status] ON [dbo].[Interventions]([Status]);
    
    PRINT 'Interventions table created successfully';
END
ELSE
BEGIN
    PRINT 'Interventions table already exists';
END
GO

-- Insert sample intervention data
INSERT INTO [dbo].[Interventions] ([StudentID], [InterventionType], [Description], [Status], [Priority], [AssignedTo])
SELECT 3, 'Academic Support', 'Additional tutoring sessions for struggling subjects', 'Active', 'High', 'Dr. Sarah Williams'
WHERE NOT EXISTS (SELECT 1 FROM Interventions WHERE StudentID = 3 AND InterventionType = 'Academic Support');

INSERT INTO [dbo].[Interventions] ([StudentID], [InterventionType], [Description], [Status], [Priority], [AssignedTo])
SELECT 1, 'Counseling', 'Weekly counseling sessions to address stress and anxiety', 'Active', 'Critical', 'Dr. James Mokoena'
WHERE NOT EXISTS (SELECT 1 FROM Interventions WHERE StudentID = 1 AND InterventionType = 'Counseling');

PRINT 'Sample intervention data inserted';
GO

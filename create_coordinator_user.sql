-- Create coordinator user for authentication
-- Password format: GUPC{First2Letters}{SurnameInitial}{Number}
-- Example for Sarah Mitchell (CoordinatorID=1): GUPCSAM001

-- First, let's check if the coordinator exists
SELECT * FROM Coordinators WHERE ContactEmail = 'sarah.mitchell@uct.ac.za';

-- Check if user already exists in Users table  
SELECT * FROM Users WHERE Email = 'sarah.mitchell@uct.ac.za';

-- Get the CoordinatorID for linking
DECLARE @CoordinatorID INT;
SELECT @CoordinatorID = CoordinatorID FROM Coordinators WHERE ContactEmail = 'sarah.mitchell@uct.ac.za';

-- Insert coordinator user into Users table if not exists
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'sarah.mitchell@uct.ac.za')
BEGIN
    INSERT INTO Users (
        Email, 
        PasswordHash, 
        UserType, 
        FirstName, 
        LastName, 
        CoordinatorID,
        IsActive, 
        IsEmailVerified, 
        CreatedAt, 
        UpdatedAt
    ) VALUES (
        'sarah.mitchell@uct.ac.za',
        '$2a$12$rrcOvsnmJwOtSjKrznUEZuKqRuR/A2hzL4QqM/sU9Dr9/Uw8yVBAC', -- GUPCSAM001 hashed with bcrypt
        'Coordinator',
        'Sarah',
        'Mitchell',
        @CoordinatorID,
        1, -- IsActive
        1, -- IsEmailVerified
        GETDATE(),
        GETDATE()
    );
    
    PRINT 'Coordinator user created successfully';
END
ELSE
BEGIN
    PRINT 'Coordinator user already exists';
    
    -- Update the user if needed
    UPDATE Users 
    SET PasswordHash = '$2a$12$5.JGLaaH3.zQhQT8QEeavu4KKK9XSqnZw3mGH3uwHAz/dc8nokKhi',
        CoordinatorID = @CoordinatorID,
        UpdatedAt = GETDATE()
    WHERE Email = 'sarah.mitchell@uct.ac.za';
    
    PRINT 'Coordinator user updated';
END

-- Verify the user was created/updated
SELECT 
    u.UserID,
    u.Email,
    u.UserType,
    u.FirstName,
    u.LastName,
    u.CoordinatorID,
    u.IsActive,
    u.IsEmailVerified,
    c.CoordinatorName,
    c.Department,
    c.UniversityID
FROM Users u
INNER JOIN Coordinators c ON u.CoordinatorID = c.CoordinatorID
WHERE u.Email = 'sarah.mitchell@uct.ac.za';

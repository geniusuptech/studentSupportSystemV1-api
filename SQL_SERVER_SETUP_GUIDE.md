# SQL Server Express Installation and Setup Guide

## Step 1: Download SQL Server Express

1. Go to: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Download "Express" version (free)
3. Choose "Download now" under SQL Server Express

## Step 2: Install SQL Server Express

1. Run the installer
2. Choose "Basic" installation type
3. Accept license terms
4. Choose installation location (default is fine)
5. Wait for installation to complete
6. **IMPORTANT**: Note down the server name shown (usually: `(localdb)\MSSQLLocalDB` or `localhost\SQLEXPRESS`)

## Step 3: Install SQL Server Management Studio (SSMS)

1. Download SSMS from: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms
2. Install with default options
3. Launch SSMS after installation

## Step 4: Connect to SQL Server

1. Open SSMS
2. In "Connect to Server" dialog:
   - Server type: Database Engine
   - Server name: `localhost\SQLEXPRESS` (or the name from step 2)
   - Authentication: Windows Authentication
   - Click "Connect"

## Step 5: Enable SQL Server Authentication (Optional)

If you prefer using username/password instead of Windows Auth:

1. Right-click server name in SSMS → Properties
2. Go to "Security" page
3. Under "Server authentication": select "SQL Server and Windows Authentication mode"
4. Click OK
5. Restart SQL Server service

## Step 6: Create SA User (if using SQL Authentication)

1. In SSMS, expand "Security" → "Logins"
2. Right-click "sa" → Properties
3. Set a strong password
4. Go to "Status" tab
5. Set Login: Enabled
6. Click OK

## Alternative: Use SQL Server LocalDB

LocalDB is a lightweight version that's easier to set up:

1. Download from: https://www.microsoft.com/en-us/download/details.aspx?id=56840
2. Install with defaults
3. Your server name will be: `(localdb)\MSSQLLocalDB`

## Docker Option (Advanced)

If you prefer Docker:

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Password123" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2019-latest
```

## Next Steps After Installation

1. Update your .env file with the correct server name
2. Run the database setup scripts
3. Test the connection
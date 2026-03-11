# Module ASSIGNMENT Endpoints

## Base URL
```
http://localhost:3001/assignment/modules
```

## Available Endpoints

### 1. Get Module by ID
**Endpoint:** `GET /assignment/modules/:id`

**Description:** Get detailed information for a specific module by their ID. This endpoint returns data structured to match the module profile page requirements.

**Example Request:**
```bash
curl -X GET http://localhost:3001/assignment/modules/21056789
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "ModuleID": 21056789,
    "ModuleName": "Lerato Khumalo",
    "ModuleNumber": "STUD21056789",
    "RiskLevel": "At Risk",
    "GPA": 2.1,
    "YearOfStudy": 2,
    "ContactEmail": "lerato.khumalo@uct.ac.za",
    "ContactPhone": "+27 83 555 4455",
    "ModuleInfo": {
      "ModuleID": 21056789,
      "ModuleName": "Lerato Khumalo",
      "ModuleNumber": "STUD21056789",
      "RiskLevel": "At Risk",
      "GPA": 2.1,
      "YearOfStudy": 2,
      "ContactEmail": "lerato.khumalo@uct.ac.za",
      "ContactPhone": "+27 83 555 4455",
      "EmergencyContact": "Thabo Khumalo",
      "EmergencyPhone": "+27 84 555 7788",
      "DateEnrolled": "2023-02-15T00:00:00.000Z",
      "LastLoginDate": "2026-02-25T08:30:00.000Z"
    },
    "UniversityInfo": {
      "UniversityID": 1,
      "UniversityName": "University of Cape Town"
    },
    "ProgramInfo": {
      "ProgramID": 1,
      "ProgramName": "BCom Accounting"
    }
  }
}
```

### 2. Get All Modules
**Endpoint:** `GET /assignment/modules`

**Description:** Get a list of all active modules.

**Example Request:**
```bash
curl -X GET http://localhost:3001/assignment/modules
```

**Example Response:**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "ModuleID": 21056789,
      "ModuleName": "Lerato Khumalo",
      "RiskLevel": "At Risk",
      "GPA": 2.1,
      "ActiveRequestCount": 0,
      // ... other module fields
    }
    // ... more modules
  ]
}
```

### 3. Get Modules by Risk Level
**Endpoint:** `GET /assignment/modules/risk/:level`

**Description:** Get all modules with a specific risk level.

**Valid Risk Levels:** `Safe`, `At Risk`, `Critical`

**Example Request:**
```bash
curl -X GET "http://localhost:3001/assignment/modules/risk/At%20Risk"
```

**Example Response:**
```json
{
  "success": true,
  "count": 25,
  "riskLevel": "At Risk",
  "data": [
    {
      "ModuleID": 21056789,
      "ModuleName": "Lerato Khumalo",
      "RiskLevel": "At Risk",
      "GPA": 2.1,
      // ... other module fields
    }
    // ... more at-risk modules
  ]
}
```

## Error Responses

### Module Not Found (404)
```json
{
  "error": "Module not found",
  "message": "Module with ID 999999 not found or inactive"
}
```

### Invalid Module ID (400)
```json
{
  "error": "Invalid module ID",
  "message": "Module ID must be a positive integer"
}
```

### Invalid Risk Level (400)
```json
{
  "error": "Invalid risk level",
  "message": "Risk level must be one of: Safe, At Risk, Critical"
}
```

## Testing

You can test these endpoints using:

1. **JavaScript/Node.js:** Run the test file:
   ```bash
   node test-module-assignment.js
   ```

2. **curl commands:** Use the example curl commands above

3. **Postman/Insomnia:** Import the endpoints using the base URL

4. **Browser:** Navigate to `http://localhost:3001/assignment/modules/21056789` for a quick test

## Notes

- All endpoints return JSON responses
- Module ID 21056789 matches the module shown in your profile page (Lerato Khumalo)
- The `getModuleById` endpoint is specifically structured to provide data for the module profile page
- Make sure your server is running before testing the endpoints

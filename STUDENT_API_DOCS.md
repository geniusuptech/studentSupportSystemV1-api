# Student API Endpoints

## Base URL
```
http://localhost:3001/api/students
```

## Available Endpoints

### 1. Get Student by ID
**Endpoint:** `GET /api/students/:id`

**Description:** Get detailed information for a specific student by their ID. This endpoint returns data structured to match the student profile page requirements.

**Example Request:**
```bash
curl -X GET http://localhost:3001/api/students/21056789
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "StudentID": 21056789,
    "StudentName": "Lerato Khumalo",
    "StudentNumber": "STUD21056789",
    "RiskLevel": "At Risk",
    "GPA": 2.1,
    "YearOfStudy": 2,
    "ContactEmail": "lerato.khumalo@uct.ac.za",
    "ContactPhone": "+27 83 555 4455",
    "StudentInfo": {
      "StudentID": 21056789,
      "StudentName": "Lerato Khumalo",
      "StudentNumber": "STUD21056789",
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

### 2. Get All Students
**Endpoint:** `GET /api/students`

**Description:** Get a list of all active students.

**Example Request:**
```bash
curl -X GET http://localhost:3001/api/students
```

**Example Response:**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "StudentID": 21056789,
      "StudentName": "Lerato Khumalo",
      "RiskLevel": "At Risk",
      "GPA": 2.1,
      "ActiveRequestCount": 0,
      // ... other student fields
    }
    // ... more students
  ]
}
```

### 3. Get Students by Risk Level
**Endpoint:** `GET /api/students/risk/:level`

**Description:** Get all students with a specific risk level.

**Valid Risk Levels:** `Safe`, `At Risk`, `Critical`

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/students/risk/At%20Risk"
```

**Example Response:**
```json
{
  "success": true,
  "count": 25,
  "riskLevel": "At Risk",
  "data": [
    {
      "StudentID": 21056789,
      "StudentName": "Lerato Khumalo",
      "RiskLevel": "At Risk",
      "GPA": 2.1,
      // ... other student fields
    }
    // ... more at-risk students
  ]
}
```

## Error Responses

### Student Not Found (404)
```json
{
  "error": "Student not found",
  "message": "Student with ID 999999 not found or inactive"
}
```

### Invalid Student ID (400)
```json
{
  "error": "Invalid student ID",
  "message": "Student ID must be a positive integer"
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
   node test-student-api.js
   ```

2. **curl commands:** Use the example curl commands above

3. **Postman/Insomnia:** Import the endpoints using the base URL

4. **Browser:** Navigate to `http://localhost:3001/api/students/21056789` for a quick test

## Notes

- All endpoints return JSON responses
- Student ID 21056789 matches the student shown in your profile page (Lerato Khumalo)
- The `getStudentById` endpoint is specifically structured to provide data for the student profile page
- Make sure your server is running before testing the endpoints
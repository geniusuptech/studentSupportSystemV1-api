// Test file for the student API endpoints
// You can run this with: node test-student-api.js
// Make sure your server is running on the specified port

const BASE_URL = 'http://localhost:3001/api';

// Test data - Based on the student shown in the profile page (Lerato Khumalo)
const TEST_STUDENT_ID = 21056789; // This matches the student ID shown in the UI

async function testStudentAPI() {
  console.log('🚀 Testing Student API Endpoints...\n');

  try {
    // Test 1: Get student by ID (matches profile page)
    console.log('📝 Test 1: Get Student by ID');
    const response = await fetch(`${BASE_URL}/students/${TEST_STUDENT_ID}`);
    
    if (response.ok) {
      const studentData = await response.json();
      console.log('✅ Success:', JSON.stringify(studentData, null, 2));
      
      // Verify the data structure matches what the profile page needs
      if (studentData.data && studentData.data.StudentInfo) {
        console.log('✅ Student data structure is correct for profile page');
        console.log(`👤 Student: ${studentData.data.StudentInfo.StudentName}`);
        console.log(`⚠️  Risk Level: ${studentData.data.StudentInfo.RiskLevel}`);
        console.log(`🏫 University: ${studentData.data.UniversityInfo.UniversityName}`);
      }
    } else {
      console.log('❌ Error:', response.status, await response.text());
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Get all students
    console.log('📝 Test 2: Get All Students');
    const allStudentsResponse = await fetch(`${BASE_URL}/students`);
    
    if (allStudentsResponse.ok) {
      const allStudents = await allStudentsResponse.json();
      console.log('✅ Success: Retrieved', allStudents.count, 'students');
      
      // Show first student as sample
      if (allStudents.data && allStudents.data.length > 0) {
        console.log('👤 First student:', allStudents.data[0].StudentName);
      }
    } else {
      console.log('❌ Error:', allStudentsResponse.status, await allStudentsResponse.text());
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Get students by risk level
    console.log('📝 Test 3: Get Students by Risk Level (At Risk)');
    const riskStudentsResponse = await fetch(`${BASE_URL}/students/risk/At Risk`);
    
    if (riskStudentsResponse.ok) {
      const riskStudents = await riskStudentsResponse.json();
      console.log('✅ Success: Retrieved', riskStudents.count, 'At Risk students');
    } else {
      console.log('❌ Error:', riskStudentsResponse.status, await riskStudentsResponse.text());
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Get student statistics
    console.log('📝 Test 4: Get Student Statistics');
    const statisticsResponse = await fetch(`${BASE_URL}/students/statistics`);
    
    if (statisticsResponse.ok) {
      const statistics = await statisticsResponse.json();
      console.log('✅ Success: Retrieved statistics');
      console.log('📊 Total Students:', statistics.data.totalStudents);
      console.log('📊 Risk Levels:', statistics.data.riskLevels);
      console.log('📊 Average GPA:', statistics.data.averageGPA);
    } else {
      console.log('❌ Error:', statisticsResponse.status, await statisticsResponse.text());
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Update student risk level (demonstrates PUT endpoint)
    console.log('📝 Test 5: Update Student Risk Level (Demo only - commented out)');
    console.log('💡 To test risk level update, uncomment the code below and modify as needed');
    console.log('⚠️  This test is commented out to avoid changing actual data');
    
    /*
    // Uncomment to test the PUT endpoint (be careful with real data!)
    const updateResponse = await fetch(`${BASE_URL}/students/${TEST_STUDENT_ID}/risk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        riskLevel: 'Critical',
        reason: 'Test update from API testing'
      })
    });
    
    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Risk level updated successfully:', updateResult.data.newRiskLevel);
    } else {
      console.log('❌ Error updating risk level:', updateResponse.status, await updateResponse.text());
    }
    */

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('💡 Make sure your server is running on http://localhost:3001');
  }
}

// Run the tests
testStudentAPI();
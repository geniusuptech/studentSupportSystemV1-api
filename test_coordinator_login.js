const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

// Test coordinator login credentials from the sample data
const coordinatorCredentials = [
    {
        email: 'sarah.mitchell@uct.ac.za',
        password: 'GUPCSAM001',
        name: 'Dr. Sarah Mitchell'
    },
    {
        email: 'david.johnson@wits.ac.za', 
        password: 'GUPCDAJ002',
        name: 'Prof. David Johnson'
    },
    {
        email: 'priya.singh@uj.ac.za',
        password: 'GUPCPRS003', 
        name: 'Ms. Priya Singh'
    },
    {
        email: 'nomsa.dlamini@ukzn.ac.za',
        password: 'GUPCNOD004',
        name: 'Dr. Nomsa Dlamini'
    }
];

async function testCoordinatorLogin(credentials) {
    try {
        console.log(`\n🧪 Testing login for: ${credentials.name}`);
        console.log(`📧 Email: ${credentials.email}`);
        
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.success) {
            console.log('✅ Login successful!');
            console.log(`👤 User Type: ${loginData.user.UserType}`);
            console.log(`🆔 Coordinator ID: ${loginData.user.CoordinatorID}`);
            console.log(`🔑 Token received: ${loginData.token ? 'Yes' : 'No'}`);
            
            // Test coordinator dashboard access
            if (loginData.token) {
                await testCoordinatorDashboard(loginData.token, credentials.name);
            }
            
            return loginData;
        } else {
            console.log('❌ Login failed:');
            console.log(loginData.message);
            return null;
        }
        
    } catch (error) {
        console.log('💥 Error during login test:');
        console.log(error.message);
        return null;
    }
}

async function testCoordinatorDashboard(token, coordinatorName) {
    try {
        console.log(`\n📊 Testing dashboard access for: ${coordinatorName}`);
        
        const dashboardResponse = await fetch(`${API_BASE_URL}/api/coordinators/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const dashboardData = await dashboardResponse.json();
        
        if (dashboardResponse.ok && dashboardData.success) {
            console.log('✅ Dashboard access successful!');
            console.log(`👥 Total Students: ${dashboardData.data.totalStudents}`);
            console.log(`⚠️ At-Risk Students: ${dashboardData.data.atRiskStudents}`);  
            console.log(`📈 Average GPA: ${dashboardData.data.averageGPA}`);
            console.log(`🔧 Active Interventions: ${dashboardData.data.activeInterventions}`);
        } else {
            console.log('❌ Dashboard access failed:');
            console.log(dashboardData.message || 'Unknown error');
        }
        
    } catch (error) {
        console.log('💥 Error during dashboard test:');
        console.log(error.message);
    }
}

async function testHealthCheck() {
    try {
        console.log('🏥 Testing API health...');
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ API is healthy');
            console.log(`⚡ Uptime: ${Math.round(data.uptime)}s`);
            return true;
        } else {
            console.log('❌ API health check failed');
            return false;
        }
    } catch (error) {
        console.log('💥 Cannot connect to API:');
        console.log(error.message);
        return false;
    }
}

async function runCoordinatorLoginTests() {
    console.log('🚀 Starting Coordinator Login Tests');
    console.log('=====================================');
    
    // First check if API is running
    const isHealthy = await testHealthCheck();
    if (!isHealthy) {
        console.log('\n❌ API is not running. Please start the server with: npm run dev');
        return;
    }
    
    let successfulLogins = 0;
    
    // Test each coordinator login
    for (const credentials of coordinatorCredentials) {
        const result = await testCoordinatorLogin(credentials);
        if (result && result.success) {
            successfulLogins++;
        }
        
        // Add delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📋 Test Summary');
    console.log('===============');
    console.log(`✅ Successful Logins: ${successfulLogins}/${coordinatorCredentials.length}`);
    console.log(`❌ Failed Logins: ${coordinatorCredentials.length - successfulLogins}/${coordinatorCredentials.length}`);
    
    if (successfulLogins === coordinatorCredentials.length) {
        console.log('\n🎉 All coordinator login tests passed!');
        console.log('👍 Coordinators can now log in and access their dashboards.');
    } else {
        console.log('\n⚠️ Some coordinator login tests failed.');
        console.log('💡 Check if the sample data has been inserted into the database.');
    }
}

// Run the tests
runCoordinatorLoginTests().catch(console.error);

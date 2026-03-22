// test-d1-connection.js
// Use this to test your Cloudflare D1 local database connection via Wrangler
// Run with: npx wrangler d1 execute "student-wellness-db" --local --command "SELECT name FROM sqlite_master WHERE type='table'"

const { execSync } = require('child_process');

console.log('🔍 Testing Cloudflare D1 Connection (Local)...\n');

try {
  console.log('📡 Fetching tables from D1...');
  const result = execSync('npx wrangler d1 execute "student-wellness-db" --local --command "SELECT name FROM sqlite_master WHERE type=\'table\'"').toString();
  
  if (result.includes('Students')) {
    console.log('✅ Connected successfully! Found Students table.');
  } else {
    console.warn('⚠️ Connected, but "Students" table not found. Did you run the onboarding script?');
  }

  console.log('\n📊 Database Status:');
  console.log(result);

  console.log('\n🧪 Testing student count...');
  const countResult = execSync('npx wrangler d1 execute "student-wellness-db" --local --command "SELECT COUNT(*) as count FROM Students"').toString();
  console.log(countResult);

} catch (error) {
  console.error('❌ Connection failed:', error.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('   - Make sure you have run "npx wrangler d1 execute student-wellness-db --local --file=./database/complete-onboarding.sql"');
  console.log('   - Verify the database name in wrangler.toml matches "student-wellness-db"');
}

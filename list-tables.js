require('dotenv').config();
require('ts-node/register/transpile-only');
const db = require('./src/config/database.ts').default;

(async () => {
  await db.connect();
  const tables = await db.executeQuery(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
  );
  console.log('Tables found:', tables.length);
  tables.forEach(t => console.log('  -', t.TABLE_NAME));
  process.exit(0);
})();

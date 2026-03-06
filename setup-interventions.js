require('dotenv').config();
const db = require('./src/config/database.ts').default;

(async () => {
  await db.connect();
  const interventions = await db.executeQuery(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.INTERVENTIONS WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
  );
  console.log('Interventions found:', interventions.length);
  interventions.forEach(t => console.log('  -', t.TABLE_NAME));
  process.exit(0);
})();

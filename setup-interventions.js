require('dotenv').config();
require('ts-node/register/transpile-only');
const db = require('./src/config/database.ts').default;

(async () => {
  await db.connect();
  const interventions = await db.executeQuery(`
    SELECT *
    FROM Interventions
    ORDER BY CreatedAt DESC
  `);
  console.log('Interventions found:', interventions.length);
  interventions.forEach(i => console.log('  -', i.InterventionID, i.InterventionType, i.Status));
  process.exit(0);
})();

const fs = require('fs');
const path = require('path');
// Load env vars since this runs standalone BEFORE requiring DB
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('./index');

const migrate = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Running database migration...');
    await pool.query(schema);
    console.log('Migration completed successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

migrate();

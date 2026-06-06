const fs = require('fs');
const path = require('path');
// Load env vars since this runs standalone BEFORE requiring DB
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('./index');

const migrate = async () => {
  try {
    const migrationFiles = [
      'schema.sql',
      'migration_001_add_bill_id.sql',
      'migration_002_fix_transactions.sql',
      'migration_003_add_customer_address.sql'
    ];

    console.log('Running database migrations...');
    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`Executing ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf-8');
        await pool.query(sql);
      } else {
        console.warn(`Migration file ${file} not found, skipping.`);
      }
    }
    console.log('Migration completed successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

migrate();

const { Client } = require('pg');

async function testConn() {
  const passwordsToTry = ['postgres', 'password', 'admin', 'root', '123456', ''];
  
  for (const p of passwordsToTry) {
    const c = new Client({ user: 'postgres', password: p, port: 5432, host: 'localhost', database: 'postgres' });
    try {
      await c.connect();
      console.log(`Success with password: "${p}"`);
      
      try {
        await c.query('CREATE DATABASE kiranaos;');
        console.log('Database kiranaos created successfully!');
      } catch (e) {
        if (e.code === '42P04') {
          console.log('Database kiranaos already exists.');
        } else {
          console.log('Error creating db:', e.message);
        }
      }
      
      await c.end();
      return; // Exit on first success
    } catch (e) {
      console.log(`Failed with password: "${p}" - ${e.message}`);
    }
  }
  console.log("Could not connect to PostgreSQL on localhost:5432 with common passwords, or it is not running.");
}

testConn();

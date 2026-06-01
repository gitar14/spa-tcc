require('dotenv').config();
const { Client } = require('pg');

async function test() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('CONNECTED!');
    await client.end();
  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();
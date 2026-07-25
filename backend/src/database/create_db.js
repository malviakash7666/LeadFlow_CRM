import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function run() {
  const connectionString = `postgresql://${process.env.DEV_DB_USERNAME}:${process.env.DEV_DB_PASSWORD}@${process.env.DEV_DB_HOST}:${process.env.DEV_DB_PORT}/postgres`;
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${process.env.DEV_DB_NAME}'`);
    if (res.rowCount === 0) {
      console.log(`Creating database ${process.env.DEV_DB_NAME}...`);
      await client.query(`CREATE DATABASE "${process.env.DEV_DB_NAME}"`);
      console.log(`Database ${process.env.DEV_DB_NAME} created successfully.`);
    } else {
      console.log(`Database ${process.env.DEV_DB_NAME} already exists.`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }
}

run();

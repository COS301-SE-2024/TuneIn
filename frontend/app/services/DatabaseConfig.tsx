// connect to aws rds and write a postgresql query to insert the user into the database
// import rds from 'rds';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'tunein-db.che0om0o6j54.af-south-1.rds.amazonaws.com',
  database: 'tunein-db',
  password: 'P6ppdnhCmw4nG8kU2a1K',
  port: '5432',
});

// console.log('Connected to the database', pool);
export default pool;
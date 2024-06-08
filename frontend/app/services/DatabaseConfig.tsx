import pg from 'pg';


const connection = {
  host: 'tunein-db.che0om0o6j54.af-south-1.rds.amazonaws.com',
  port: 5432,
  database: 'tunein-db',
  user: 'postgres',
  password: 'P6ppdnhCmw4nG8kU2a1K'
};

const pool = new pg.Pool(connection);
console.log('Connected to the database', pool);
pool.query(`SELECT * FROM users`, (err, res) => {
  console.log(err, res);
  pool.end();
});
export default pool;
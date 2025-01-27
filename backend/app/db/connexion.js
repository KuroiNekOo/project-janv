import knex from 'knex';

export const connexion = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'ghost',
    password: process.env.DB_PASSWORD || 'ghost',
    database: process.env.DB_DATABASE || 'database',
    ssl: false,
  },
  pool: {
    min: Number.parseInt(process.env.DB_POOL_MIN, 10) || 0,
    max: Number.parseInt(process.env.DB_POOL_MAX, 10) || 10,
  },
});
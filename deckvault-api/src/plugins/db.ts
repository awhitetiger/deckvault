import fastifyPlugin from 'fastify-plugin';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('DB config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export default fastifyPlugin(async (fastify) => {
  fastify.decorate('db', pool);
});
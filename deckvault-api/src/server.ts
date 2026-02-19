import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import dbPlugin from './plugins/db';
import authRoutes from './routes/auth';

dotenv.config();

const server = Fastify({ logger: true });

server.register(cors, { origin: true });
server.register(dbPlugin);
server.register(authRoutes);

server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
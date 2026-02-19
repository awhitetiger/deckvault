import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/api/v1/auth/register', async (req, reply) => {
    const { email, username, password } = req.body as any;

    if (!email || !username || !password) {
      return reply.status(400).send({ error: 'All fields required' });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 12);

      const result = await (fastify as any).db.query(
        `INSERT INTO users (email, username, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, username, created_at`,
        [email, username, passwordHash]
      );

      const user = result.rows[0];
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      return reply.status(201).send({ user, token });
    } catch (err: any) {
      if (err.code === '23505') {
        return reply.status(409).send({ error: 'Email or username already taken' });
      }
      return reply.status(500).send({ error: 'Server error' });
    }
  });

  // Login
  fastify.post('/api/v1/auth/login', async (req, reply) => {
    const { email, password } = req.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password required' });
    }

    try {
      const result = await (fastify as any).db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      const user = result.rows[0];

      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      });
    } catch {
      return reply.status(500).send({ error: 'Server error' });
    }
  });
}
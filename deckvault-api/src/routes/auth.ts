import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateTokens(userId: string, username: string) {
  const accessToken = jwt.sign(
    { userId, username },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' as any }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');

  return { accessToken, refreshToken };
}

export default async function authRoutes(fastify: FastifyInstance) {
  const db = (fastify as any).db;

  // Register
  fastify.post('/api/v1/auth/register', async (req, reply) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return reply.status(400).send({ error: result.error.issues[0].message });
    }

    const { email, username, password } = result.data;

    try {
      const passwordHash = await bcrypt.hash(password, 12);

      const userResult = await db.query(
        `INSERT INTO users (email, username, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, username, created_at`,
        [email, username, passwordHash]
      );

      const user = userResult.rows[0];
      const { accessToken, refreshToken } = generateTokens(user.id, user.username);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, refreshToken, expiresAt]
      );

      return reply.status(201).send({ user, accessToken, refreshToken });
    } catch (err: any) {
      if (err.code === '23505') {
        return reply.status(409).send({ error: 'Email or username already taken' });
      }
      return reply.status(500).send({ error: 'Server error' });
    }
  });

  // Login
  fastify.post('/api/v1/auth/login', async (req, reply) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return reply.status(400).send({ error: result.error.issues[0].message });
    }

    const { email, password } = result.data;

    try {
      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      const user = userResult.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const { accessToken, refreshToken } = generateTokens(user.id, user.username);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, refreshToken, expiresAt]
      );

      return reply.send({
        user: { id: user.id, email: user.email, username: user.username },
        accessToken,
        refreshToken,
      });
    } catch {
      return reply.status(500).send({ error: 'Server error' });
    }
  });

  // Refresh token
  fastify.post('/api/v1/auth/refresh', async (req, reply) => {
    const { refreshToken } = req.body as any;

    if (!refreshToken) {
      return reply.status(400).send({ error: 'Refresh token required' });
    }

    try {
      const result = await db.query(
        `SELECT rt.*, u.username FROM refresh_tokens rt
         JOIN users u ON u.id = rt.user_id
         WHERE rt.token = $1 AND rt.expires_at > NOW()`,
        [refreshToken]
      );

      const tokenRecord = result.rows[0];

      if (!tokenRecord) {
        return reply.status(401).send({ error: 'Invalid or expired refresh token' });
      }

      await db.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenRecord.id]);

      const tokens = generateTokens(tokenRecord.user_id, tokenRecord.username);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [tokenRecord.user_id, tokens.refreshToken, expiresAt]
      );

      return reply.send(tokens);
    } catch {
      return reply.status(500).send({ error: 'Server error' });
    }
  });

  // Logout
  fastify.post('/api/v1/auth/logout', async (req, reply) => {
    const { refreshToken } = req.body as any;

    if (refreshToken) {
      await db.query(
        'DELETE FROM refresh_tokens WHERE token = $1',
        [refreshToken]
      );
    }

    return reply.send({ message: 'Logged out successfully' });
  });
}
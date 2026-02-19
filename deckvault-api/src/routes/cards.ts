import { FastifyInstance } from 'fastify';

export default async function cardRoutes(fastify: FastifyInstance) {
  // Search cards
  fastify.get('/api/v1/cards/search', async (req, reply) => {
    const { q, page = 1, limit = 20 } = req.query as any;

    if (!q || q.trim().length < 2) {
      return reply.status(400).send({ error: 'Query must be at least 2 characters' });
    }

    const offset = (Number(page) - 1) * Number(limit);

    try {
      const result = await (fastify as any).db.query(
        `SELECT id, ygo_card_id, name, card_type, attribute,
                monster_type, attack, defense, image_url,
                tcgplayer_price, card_market_price
         FROM cards
         WHERE name ILIKE $1
         ORDER BY name
         LIMIT $2 OFFSET $3`,
        [`%${q}%`, limit, offset]
      );

      return reply.send({
        cards: result.rows,
        page: Number(page),
        limit: Number(limit),
        count: result.rows.length,
      });
    } catch {
      return reply.status(500).send({ error: 'Server error' });
    }
  });

  // Get card by ID
  fastify.get('/api/v1/cards/:id', async (req, reply) => {
    const { id } = req.params as any;

    try {
      const result = await (fastify as any).db.query(
        'SELECT * FROM cards WHERE id = $1',
        [id]
      );

      if (!result.rows[0]) {
        return reply.status(404).send({ error: 'Card not found' });
      }

      return reply.send(result.rows[0]);
    } catch {
      return reply.status(500).send({ error: 'Server error' });
    }
  });
}
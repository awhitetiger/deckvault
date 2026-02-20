import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/authenticate';

export default async function binderRoutes(fastify: FastifyInstance) {
  const db = (fastify as any).db;

  // Get all binders for current user
  fastify.get('/api/v1/binders', { preHandler: authenticate }, async (req, reply) => {
    const { userId } = (req as any).user;

    const result = await db.query(
      `SELECT b.*, COUNT(bc.id) as card_count
       FROM binders b
       LEFT JOIN binder_cards bc ON bc.binder_id = b.id
       WHERE b.user_id = $1
       GROUP BY b.id
       ORDER BY b.created_at DESC`,
      [userId]
    );

    return reply.send({ binders: result.rows });
  });

  // Create binder
  fastify.post('/api/v1/binders', { preHandler: authenticate }, async (req, reply) => {
    const { userId } = (req as any).user;
    const { name, description, cover_color, is_public } = req.body as any;

    if (!name) return reply.status(400).send({ error: 'Name is required' });

    const result = await db.query(
      `INSERT INTO binders (user_id, name, description, cover_color, is_public)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, description || null, cover_color || '#1a1a2e', is_public || false]
    );

    return reply.status(201).send({ binder: result.rows[0] });
  });

  // Update binder
  fastify.patch('/api/v1/binders/:id', { preHandler: authenticate }, async (req, reply) => {
    const { userId } = (req as any).user;
    const { id } = req.params as any;
    const { name, description, cover_color, is_public } = req.body as any;

    const result = await db.query(
      `UPDATE binders SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        cover_color = COALESCE($3, cover_color),
        is_public = COALESCE($4, is_public),
        updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, description, cover_color, is_public, id, userId]
    );

    if (!result.rows[0]) return reply.status(404).send({ error: 'Binder not found' });
    return reply.send({ binder: result.rows[0] });
  });

// Reorder cards in binder
fastify.patch('/api/v1/binders/:id/reorder', { preHandler: authenticate }, async (req, reply) => {
  const { userId } = (req as any).user;
  const { id } = req.params as any;
  const { cards } = req.body as any;

  // Verify binder belongs to user
  const binderCheck = await db.query(
    'SELECT id FROM binders WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!binderCheck.rows[0]) return reply.status(404).send({ error: 'Binder not found' });

  // Validate cards array
  if (!Array.isArray(cards) || cards.length === 0) {
    return reply.status(400).send({ error: 'Cards array is required' });
  }

  // Use a transaction so a crash mid-reorder doesn't corrupt slot positions
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    for (const card of cards) {
      await client.query(
        `UPDATE binder_cards
         SET page_number = $1, slot_position = $2
         WHERE id = $3 AND binder_id = $4`,
        [card.page, card.slot, card.id, id]
      );
    }

    await client.query('COMMIT');
    return reply.send({ message: 'Reorder successful' });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

  // Delete binder
  fastify.delete('/api/v1/binders/:id', { preHandler: authenticate }, async (req, reply) => {
    const { userId } = (req as any).user;
    const { id } = req.params as any;

    await db.query('DELETE FROM binders WHERE id = $1 AND user_id = $2', [id, userId]);
    return reply.send({ message: 'Binder deleted' });
  });

  // Add card to binder
  fastify.post('/api/v1/binders/:id/cards', { preHandler: authenticate }, async (req, reply) => {
    const { userId } = (req as any).user;
    const { id } = req.params as any;
    const { card_id, condition, quantity, foil_type, acquisition_price, notes, rarity, set_code, edition } = req.body as any;
    // Verify binder belongs to user
    const binderCheck = await db.query(
      'SELECT id FROM binders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!binderCheck.rows[0]) return reply.status(404).send({ error: 'Binder not found' });

    // Get next available slot
    const slotResult = await db.query(
      `SELECT page_number, slot_position FROM binder_cards
       WHERE binder_id = $1
       ORDER BY page_number DESC, slot_position DESC
       LIMIT 1`,
      [id]
    );

    let page = 1;
    let slot = 0;

    if (slotResult.rows[0]) {
      const last = slotResult.rows[0];
      if (last.slot_position < 8) {
        page = last.page_number;
        slot = last.slot_position + 1;
      } else {
        page = last.page_number + 1;
        slot = 0;
      }
    }

    const result = await db.query(
      `INSERT INTO binder_cards
        (binder_id, card_id, page_number, slot_position, condition, quantity, foil_type, acquisition_price, notes, rarity, set_code, edition)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [id, card_id, page, slot, condition || 'NM', quantity || 1, foil_type || null, acquisition_price || null, notes || null, rarity || null, set_code || null, edition || 'unlimited']
    );

    return reply.status(201).send({ binder_card: result.rows[0] });
  });

  // Get cards in binder
  fastify.get('/api/v1/binders/:id/cards', { preHandler: authenticate }, async (req, reply) => {
    const { id } = req.params as any;

    const result = await db.query(
      `SELECT bc.*, c.name, c.card_type, c.image_url, c.tcgplayer_price, c.card_market_price
       FROM binder_cards bc
       JOIN cards c ON c.id = bc.card_id
       WHERE bc.binder_id = $1
       ORDER BY bc.page_number, bc.slot_position`,
      [id]
    );

    return reply.send({ cards: result.rows });
  });

  // Remove card from binder
  fastify.delete('/api/v1/binders/:id/cards/:cardId', { preHandler: authenticate }, async (req, reply) => {
    const { id, cardId } = req.params as any;

    await db.query('DELETE FROM binder_cards WHERE id = $1 AND binder_id = $2', [cardId, id]);
    return reply.send({ message: 'Card removed' });
  });
}
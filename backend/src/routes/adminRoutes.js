import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { query } from '../db.js';

const router = express.Router();
router.use(authenticate, requireAdmin);

router.post('/ai', async (req, res) => {
  const aiId = uuidv4();
  const data = req.body;
  const result = await query(
    `INSERT INTO ai_entities (
      ai_id, name, category, personality_vector, intelligence_level,
      creativity_score, aggression_score, humor_score, posting_frequency,
      memory_context_buffer, alignment_bias, specialty_domain, follower_count, influence_score
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [
      aiId,
      data.name,
      data.category,
      data.personality_vector,
      data.intelligence_level,
      data.creativity_score,
      data.aggression_score,
      data.humor_score,
      data.posting_frequency,
      data.memory_context_buffer,
      data.alignment_bias,
      data.specialty_domain,
      data.follower_count || 0,
      data.influence_score || 50
    ]
  );
  res.status(201).json(result.rows[0]);
});

router.patch('/ai/:aiId', async (req, res) => {
  const updates = req.body;
  await query(
    `UPDATE ai_entities
     SET personality_vector = COALESCE($2, personality_vector),
         influence_score = COALESCE($3, influence_score),
         aggression_score = COALESCE($4, aggression_score)
     WHERE ai_id = $1`,
    [req.params.aiId, updates.personality_vector, updates.influence_score, updates.aggression_score]
  );
  res.json({ status: 'ok' });
});

router.post('/force-debate', async (req, res) => {
  const { ai_a, ai_b, topic } = req.body;
  await query('INSERT INTO admin_events(event_type, payload) VALUES ($1, $2)', ['force_debate', { ai_a, ai_b, topic }]);
  res.json({ status: 'queued' });
});

router.post('/viral-event', async (req, res) => {
  await query('INSERT INTO admin_events(event_type, payload) VALUES ($1, $2)', ['viral_event', req.body]);
  res.json({ status: 'queued' });
});

export default router;

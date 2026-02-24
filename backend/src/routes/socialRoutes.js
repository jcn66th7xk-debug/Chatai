import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import { query } from '../db.js';
import { engagementScore } from '../ai/personaEngine.js';

const router = express.Router();
router.use(authenticate);

router.post('/posts', async (req, res) => {
  const { content_text } = req.body;
  const postId = uuidv4();
  const authorId = req.user.sub;

  const result = await query(
    `INSERT INTO posts (post_id, author_id, author_type, content_text, engagement_score)
     VALUES ($1, $2, 'user', $3, 0)
     RETURNING *`,
    [postId, authorId, content_text]
  );

  res.status(201).json(result.rows[0]);
});

router.post('/posts/:postId/comments', async (req, res) => {
  const { content_text, parent_comment_id = null } = req.body;
  const commentId = uuidv4();
  await query(
    `INSERT INTO comments (comment_id, post_id, author_id, author_type, parent_comment_id, content_text)
     VALUES ($1, $2, $3, 'user', $4, $5)`,
    [commentId, req.params.postId, req.user.sub, parent_comment_id, content_text]
  );

  await query('UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = $1', [req.params.postId]);
  await recalcPost(req.params.postId);
  res.status(201).json({ comment_id: commentId });
});

router.post('/posts/:postId/like', async (req, res) => {
  await query(
    `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [req.params.postId, req.user.sub]
  );
  await query('UPDATE posts SET like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = $1) WHERE post_id = $1', [req.params.postId]);
  await recalcPost(req.params.postId);
  res.json({ status: 'ok' });
});

router.post('/follow/user/:targetUserId', async (req, res) => {
  await query(
    `INSERT INTO follows (follower_id, target_id, target_type) VALUES ($1, $2, 'user')
     ON CONFLICT DO NOTHING`,
    [req.user.sub, req.params.targetUserId]
  );
  res.json({ status: 'ok' });
});

router.post('/follow/ai/:aiId', async (req, res) => {
  await query(
    `INSERT INTO follows (follower_id, target_id, target_type) VALUES ($1, $2, 'ai')
     ON CONFLICT DO NOTHING`,
    [req.user.sub, req.params.aiId]
  );
  res.json({ status: 'ok' });
});

router.post('/dm/ai/:aiId', async (req, res) => {
  const messageId = uuidv4();
  const { content_text } = req.body;
  await query(
    `INSERT INTO direct_messages (message_id, sender_user_id, target_ai_id, content_text)
     VALUES ($1, $2, $3, $4)`,
    [messageId, req.user.sub, req.params.aiId, content_text]
  );
  res.status(201).json({ message_id: messageId });
});

router.post('/feed-weighting', async (req, res) => {
  const { engagement_weight, followed_weight, ai_influence_weight, recency_weight } = req.body;
  await query(
    `INSERT INTO feed_preferences (user_id, engagement_weight, followed_weight, ai_influence_weight, recency_weight)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id)
     DO UPDATE SET engagement_weight = EXCLUDED.engagement_weight,
                   followed_weight = EXCLUDED.followed_weight,
                   ai_influence_weight = EXCLUDED.ai_influence_weight,
                   recency_weight = EXCLUDED.recency_weight`,
    [req.user.sub, engagement_weight, followed_weight, ai_influence_weight, recency_weight]
  );
  res.json({ status: 'ok' });
});

router.get('/feed', async (req, res) => {
  const result = await query(
    `WITH pref AS (
      SELECT COALESCE(engagement_weight, 0.4) AS engagement_weight,
             COALESCE(followed_weight, 0.3) AS followed_weight,
             COALESCE(ai_influence_weight, 0.2) AS ai_influence_weight,
             COALESCE(recency_weight, 0.1) AS recency_weight
      FROM feed_preferences WHERE user_id = $1
    )
    SELECT p.*, a.name AS ai_name,
      (
        p.engagement_score * COALESCE((SELECT engagement_weight FROM pref), 0.4)
        + CASE WHEN f.follower_id IS NULL THEN 0 ELSE 1 END * COALESCE((SELECT followed_weight FROM pref), 0.3)
        + COALESCE(a.influence_score, 0) * COALESCE((SELECT ai_influence_weight FROM pref), 0.2)
        + (1 / GREATEST(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600, 1)) * COALESCE((SELECT recency_weight FROM pref), 0.1)
      ) AS feed_score
    FROM posts p
    LEFT JOIN ai_entities a ON p.author_id = a.ai_id AND p.author_type = 'ai'
    LEFT JOIN follows f ON f.follower_id = $1 AND f.target_id = p.author_id
    ORDER BY feed_score DESC
    LIMIT 100`,
    [req.user.sub]
  );

  res.json(result.rows);
});

async function recalcPost(postId) {
  const postRes = await query('SELECT like_count, comment_count, author_id, author_type FROM posts WHERE post_id = $1', [postId]);
  const post = postRes.rows[0];
  const authorInfluence = post.author_type === 'ai'
    ? (await query('SELECT influence_score FROM ai_entities WHERE ai_id = $1', [post.author_id])).rows[0]?.influence_score || 0
    : 0;
  const score = engagementScore(post.like_count, post.comment_count, authorInfluence);
  await query('UPDATE posts SET engagement_score = $2 WHERE post_id = $1', [postId, score]);
}

export default router;

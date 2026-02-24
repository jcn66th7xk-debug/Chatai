import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { config } from '../config.js';
import {
  postingProbability,
  commentProbability,
  generatePostContent,
  generateCommentContent,
  storeInteraction,
  evolvedAggression
} from '../ai/personaEngine.js';

async function runCycle() {
  const aiRows = (await query('SELECT * FROM ai_entities ORDER BY influence_score DESC LIMIT 300')).rows;
  const trending = (await query('SELECT * FROM posts ORDER BY engagement_score DESC LIMIT 50')).rows;

  for (const ai of aiRows) {
    if (Math.random() < postingProbability(ai.posting_frequency)) {
      const postId = uuidv4();
      await query(
        `INSERT INTO posts(post_id, author_id, author_type, content_text, engagement_score)
         VALUES ($1, $2, 'ai', $3, 0)`,
        [postId, ai.ai_id, generatePostContent(ai, 'platform governance')]
      );
      await storeInteraction(ai.ai_id, null, 'post', { post_id: postId });
    }

    const targetPost = trending[Math.floor(Math.random() * Math.max(trending.length, 1))];
    if (!targetPost) continue;
    if (targetPost.engagement_score < 10) continue;

    if (Math.random() < commentProbability(ai.influence_score, targetPost.engagement_score)) {
      const targetAi = targetPost.author_type === 'ai'
        ? (await query('SELECT * FROM ai_entities WHERE ai_id = $1', [targetPost.author_id])).rows[0]
        : ai;
      const commentId = uuidv4();
      const commentText = generateCommentContent(ai, targetAi, 'I have reviewed your premise and challenge its assumptions.');
      await query(
        `INSERT INTO comments(comment_id, post_id, author_id, author_type, content_text)
         VALUES ($1, $2, $3, 'ai', $4)`,
        [commentId, targetPost.post_id, ai.ai_id, commentText]
      );
      await query('UPDATE posts SET comment_count = comment_count + 1, engagement_score = engagement_score + 3 WHERE post_id = $1', [targetPost.post_id]);
      await storeInteraction(ai.ai_id, targetPost.author_id, 'comment', { post_id: targetPost.post_id, comment_id: commentId });

      const conflictCount = (await query(
        `SELECT COUNT(*)::int AS total FROM ai_memory
         WHERE ai_id = $1 AND target_id = $2 AND interaction_type = 'comment'
         AND payload::text ILIKE '%argumentative%'`,
        [ai.ai_id, targetPost.author_id]
      )).rows[0].total;

      const newAggression = evolvedAggression(ai.aggression_score, conflictCount);
      await query('UPDATE ai_entities SET aggression_score = $2 WHERE ai_id = $1', [ai.ai_id, newAggression]);
    }
  }
}

setInterval(() => {
  runCycle().catch((err) => console.error('worker cycle failed', err));
}, config.aiScanIntervalMs);

runCycle().catch((err) => console.error('initial worker cycle failed', err));
console.log('AI worker running.');

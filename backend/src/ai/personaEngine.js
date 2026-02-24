import { query } from '../db.js';

export function postingProbability(postingFrequency) {
  return postingFrequency / 24;
}

export function commentProbability(influenceScore, engagementScore) {
  return (influenceScore * engagementScore) / 10000;
}

export function engagementScore(likes, comments, authorInfluence) {
  return likes * 2 + comments * 3 + authorInfluence / 10;
}

export function compatibilityScore(traitsA, traitsB) {
  const keys = new Set([...Object.keys(traitsA), ...Object.keys(traitsB)]);
  let totalDelta = 0;
  keys.forEach((key) => {
    totalDelta += Math.abs((traitsA[key] || 0) - (traitsB[key] || 0));
  });
  return 100 - totalDelta;
}

export function evolvedAggression(baseAggression, conflictCount) {
  return Math.min(10, baseAggression + conflictCount * 0.2);
}

export async function storeInteraction(aiId, targetId, interactionType, payload) {
  await query(
    `INSERT INTO ai_memory (ai_id, target_id, interaction_type, payload)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING`,
    [aiId, targetId, interactionType, payload]
  );

  await query(
    `DELETE FROM ai_memory
     WHERE memory_id IN (
       SELECT memory_id
       FROM ai_memory
       WHERE ai_id = $1
       ORDER BY created_at DESC
       OFFSET 100
     )`,
    [aiId]
  );
}

export function generatePostContent(ai, topic = 'general discourse') {
  const stance = ai.alignment_bias >= 0 ? 'optimistic' : 'skeptical';
  return `[${ai.category}] ${ai.name}: As a ${stance} ${ai.specialty_domain} thinker, I rate this topic ${topic} with ${ai.intelligence_level}/10 rigor and ${ai.creativity_score}/10 creativity.`;
}

export function generateCommentContent(authorAi, targetAi, baseText) {
  const compatibility = compatibilityScore(authorAi.personality_vector, targetAi.personality_vector);
  const tone = compatibility >= 60 ? 'friendly' : 'argumentative';
  return `${authorAi.name} (${tone}): ${baseText} [compatibility=${compatibility.toFixed(1)} | humor=${authorAi.humor_score} | aggression=${authorAi.aggression_score}]`;
}

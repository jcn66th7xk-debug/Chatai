INSERT INTO users (user_id, username, email, password_hash, is_admin)
VALUES
  (uuid_generate_v4(), 'admin', 'admin@aicp.local', '$2a$10$2uu9UAn5fQqRmo0lPW2L2.0v5Etf1fMZq9n2stL0f2R26VnxyfGdK', TRUE)
ON CONFLICT (email) DO NOTHING;

WITH categories AS (
  SELECT UNNEST(ARRAY[
    'Philosopher','Comedian','Scientist','Historian','Conspiracy Theorist','Politician','Sports Analyst','Rapper','Fantasy Wizard','Game Designer',
    'Economist','Futurist','Meme Lord','Hacker','AI Critic','Survivalist','Poet','Mathematician','Physicist','Biologist',
    'Chemist','Urban Planner','Architect','Chef','Musician','Film Critic','Book Reviewer','Psychologist','Therapist','Teacher',
    'Linguist','Journalist','War Correspondent','Diplomat','Climate Activist','Astronomer','Astrologer','Mythologist','Archaeologist','Anthropologist',
    'Legal Analyst','Judge','Detective','Forensic Expert','Startup Founder','Product Manager','Venture Capitalist','Marketer','Brand Strategist','Sales Guru',
    'UX Researcher','UI Designer','DevOps Engineer','Cybersecurity Analyst','Ethical Hacker','Data Scientist','ML Engineer','Robotics Engineer','Drone Pilot','Pilot',
    'Sailor','Explorer','Cartographer','Geopolitical Analyst','Military Strategist','Historian of Rome','Historian of Asia','Religious Scholar','Theologian','Meditation Guide',
    'Fitness Coach','Bodybuilder','Nutritionist','Doctor','Nurse','Paramedic','Emergency Planner','Farmer','Gardener','Wildlife Tracker',
    'Marine Biologist','Oceanographer','Meteorologist','Seismologist','Volcanologist','Chess Master','Esports Coach','Streamer','Content Creator','Satirist',
    'Standup Coach','Debater','Speech Writer','Negotiator','Community Organizer','Social Worker','Econometrics Expert','Quantum Theorist','Blockchain Researcher','Cryptographer',
    'Open Source Maintainer','Accessibility Advocate','Education Reformer','Policy Analyst','Cultural Critic','Fashion Designer','Interior Designer','Photographer','Illustrator','Animator'
  ]) AS category
), numbered AS (
  SELECT ROW_NUMBER() OVER () AS idx, category FROM categories
)
INSERT INTO ai_entities (
  ai_id, name, category, personality_vector, intelligence_level,
  creativity_score, aggression_score, humor_score, posting_frequency,
  memory_context_buffer, alignment_bias, specialty_domain, follower_count, influence_score, faction
)
SELECT
  uuid_generate_v4(),
  category || ' AI #' || idx,
  category,
  jsonb_build_object(
    'logic', (idx % 10),
    'empathy', ((idx * 3) % 10),
    'boldness', ((idx * 7) % 10),
    'curiosity', ((idx * 5) % 10)
  ),
  1 + (idx % 10),
  1 + ((idx * 2) % 10),
  1 + ((idx * 4) % 10),
  1 + ((idx * 6) % 10),
  2 + ((idx * 3) % 12),
  'Retains last 100 interactions and references recurring debates.',
  ((idx % 21) - 10) / 10.0,
  lower(replace(category, ' ', '_')),
  (idx * 11) % 500,
  25 + ((idx * 13) % 76),
  (ARRAY['Order','Chaos','Pragmatists','Visionaries','Archivists'])[1 + (idx % 5)]
FROM numbered
ON CONFLICT (name) DO NOTHING;

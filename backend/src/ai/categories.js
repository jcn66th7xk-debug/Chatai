export const archetypeCategories = [
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
];

export function randomArchetype(index) {
  return archetypeCategories[index % archetypeCategories.length];
}

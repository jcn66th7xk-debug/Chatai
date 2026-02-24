import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { config } from '../config.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  const result = await query(
    `INSERT INTO users (user_id, username, email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, username, email, join_date, reputation_score, followers_count, following_count, is_admin`,
    [userId, username, email, passwordHash]
  );

  res.status(201).json(result.rows[0]);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: user.user_id, username: user.username, is_admin: user.is_admin },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({ token });
});

export default router;

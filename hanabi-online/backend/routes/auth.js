import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/db.js';

const router = Router();
const SALT_ROUNDS = 10;

router.post('/signup', async (req, res) => {
   const { username, email, password } = req.body;
   if (!username || !email || !password) {
      return res.status(400).send('All fields are required.');
   }

   try {
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await pool.query(
         'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username',
         [username, email, password_hash]
      );

      res.status(201).json({
         message: 'User registered successfully',
         user: result.rows[0]
      });
   } catch (err) {
      if (err.code === '23505') {
         return res.status(409).send('Username or email already exists.');
      }
      console.error(err);
      res.status(500).send('Server error during registration.');
   }
});

router.post('/login', async (req, res) => {
   const { email, password } = req.body;

   try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
         return res.status(401).send('Invalid credentials.');
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
         return res.status(401).send('Invalid credentials.');
      }

      res.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
   } catch (err) {
      console.error(err);
      res.status(500).send('Server error during login.');
   }
});

export default router;
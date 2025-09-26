import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from '../db.js';

dotenv.config();
const router = express.Router();

// Google OAuth callback
router.post('/google', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ message: 'Google user data incomplete' });
    }

    // Kullanıcıyı veritabanında ara veya oluştur
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      // Yeni kullanıcı oluştur
      result = await pool.query(
        'INSERT INTO users (username, email, password, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, username, email, avatar_url',
        [displayName || email.split('@')[0], email, 'google_oauth', photoURL || null]
      );
      user = result.rows[0];
    } else if (photoURL && !user.avatar_url) {
      // Mevcut kullanıcının avatar'ını güncelle
      await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [photoURL, user.id]);
      user.avatar_url = photoURL;
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      message: 'Google login successful', 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });

  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

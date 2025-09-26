import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../middleware/auth.js';
import { pool } from '../db.js';

const router = express.Router();

// Simple disk storage for avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// GET profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, avatar_url FROM users WHERE id=$1', [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE profile (username and password)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    
    if (!username) return res.status(400).json({ message: 'Username required' });
    
    // Eğer şifre değiştirilmek isteniyorsa
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      
      // Mevcut şifreyi kontrol et
      const userResult = await pool.query('SELECT password FROM users WHERE id=$1', [req.user.id]);
      const user = userResult.rows[0];
      
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      // Google OAuth kullanıcıları için şifre kontrolü atla
      if (user.password !== 'google_oauth') {
        const bcrypt = await import('bcryptjs');
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) return res.status(400).json({ message: 'Current password incorrect' });
      }
      
      // Yeni şifreyi hashle ve güncelle
      const bcrypt = await import('bcryptjs');
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const result = await pool.query(
        'UPDATE users SET username=$1, password=$2 WHERE id=$3 RETURNING id, username, email, avatar_url', 
        [username, hashedNewPassword, req.user.id]
      );
      res.json(result.rows[0]);
    } else {
      // Sadece username güncelle
      const result = await pool.query('UPDATE users SET username=$1 WHERE id=$2 RETURNING id, username, email, avatar_url', [username, req.user.id]);
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    const result = await pool.query('UPDATE users SET avatar_url=$1 WHERE id=$2 RETURNING id, username, email, avatar_url', [avatarUrl, req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;



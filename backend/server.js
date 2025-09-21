const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı: ' + socket.id);
  socket.on('disconnect', () => console.log('Kullanıcı ayrıldı: ' + socket.id));
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Register
app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    res.json({ message: 'Kayıt başarılı!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Kayıt sırasında hata oluştu');
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(400).send('Kullanıcı bulunamadı');

    const user = result.rows[0];
    if (await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
      res.json({ token });
    } else {
      res.status(400).send('Şifre hatalı');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Giriş sırasında hata oluştu');
  }
});

// Add Mood (Authenticated)
app.post('/mood', authenticateToken, async (req, res) => {
  const { mood, note } = req.body;
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'INSERT INTO moodentries(user_id, mood, note) VALUES($1, $2, $3) RETURNING *',
      [user_id, mood, note]
    );
    const newMood = result.rows[0];

    // Socket.IO broadcast
    io.emit('new-mood', newMood);

    res.json(newMood);
  } catch (err) {
    console.error(err);
    res.status(500).send('Mood eklenemedi');
  }
});

// Get User Moods
app.get('/mood', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query('SELECT * FROM moodentries WHERE user_id=$1 ORDER BY created_at DESC', [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Moodlar alınamadı');
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));

// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2/promise');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // replace with your frontend URL for production
  },
});

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// MySQL pool config
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'barrie74217921',
  database: process.env.DB_NAME || 'skillswap',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Make pool accessible in req for routes
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// --- Socket.IO realtime chat setup ---
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', async (msg) => {
    const { from, to, text, timestamp } = msg;
    try {
      // Save message to DB
      await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, text, timestamp) VALUES (?, ?, ?, ?)`,
        [from, to, text, new Date(timestamp)]
      );

      io.to(to).emit('receiveMessage', msg);
      io.to(from).emit('receiveMessage', msg);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});

// --- API Chat routes ---
app.post('/api/chat/save', async (req, res) => {
  try {
    const { from, to, text, timestamp } = req.body;
    if (!from || !to || !text || !timestamp) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const query = `INSERT INTO messages (sender_id, receiver_id, text, timestamp) VALUES (?, ?, ?, ?)`;
    await pool.execute(query, [from, to, text, new Date(timestamp)]);
    res.json({ message: 'Message saved' });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

app.get('/api/chat/history/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const query = `
      SELECT sender_id AS \`from\`, receiver_id AS \`to\`, text, timestamp
      FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY timestamp ASC
    `;
    const [rows] = await pool.execute(query, [user1, user2, user2, user1]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching message history:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// --- Import and use auth and dashboard routes ---
const authRoutes = require(path.join(__dirname, 'routes', 'auth'));
const dashboardRoutes = require(path.join(__dirname, 'routes', 'dashboard'));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

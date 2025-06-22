// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const db = require('./db'); // ✅ Ensure DB is initialized
const userRoutes = require('./routes/user'); // ✅ Add this

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Parses JSON request bodies

// ✅ Routes
app.use('/api/auth', authRoutes); // /api/auth/register and /api/auth/login
app.use('/api/dashboard', dashboardRoutes); // For dashboard data (students & matches)

// ✅ Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

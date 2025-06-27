// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const db = require('./db'); 
const userRoutes = require('./routes/user'); 

dotenv.config();

const app = express();

//  Middleware
app.use(cors());
app.use(express.json()); 

//  Routes
app.use('/api/auth', authRoutes); 
app.use('/api/dashboard', dashboardRoutes); 

//  Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

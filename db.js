// db.js
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'barrie74217921',
        database: 'skillswap',
      
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

module.exports = db;

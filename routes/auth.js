const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Replace this with your actual secret (or use .env variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

//  Register
router.post('/register', async (req, res) => {
  const { name, email, password, skill, reason, role, profileImage } = req.body;

  if (!name || !email || !password || !skill || !reason || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const [existingUser] = await db.promise().query('SELECT * FROM students WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO students (name, email, password, skill, reason, role, profile_image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.promise().query(sql, [name, email, hashedPassword, skill, reason, role, profileImage]);

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, name }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ message: 'Registration successful.', token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

//  Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.promise().query('SELECT * FROM students WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// DELETE student account by ID
router.delete('/user/:id', async (req, res) => {
    const studentId = req.params.id;

    try {
        await db.execute('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [studentId, studentId]);
        await db.execute('DELETE FROM matches WHERE student1_id = ? OR student2_id = ?', [studentId, studentId]);

        const [result] = await db.execute('DELETE FROM students WHERE id = ?', [studentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;

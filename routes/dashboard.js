const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ NO "authenticate" here
router.get('/', async (req, res) => {
  try {
    const [students] = await db.promise().query('SELECT * FROM students');

    const matches = [];
    for (let a of students) {
      for (let b of students) {
        if (
          a.id !== b.id &&
          a.skill === b.skill &&
          a.role === 'offer' &&
          b.role === 'learn'
        ) {
          matches.push({ offer: a, learn: b });
        }
      }
    }
    

    res.json({ students, matches });
  } catch (err) {
    res.status(500).json({ message: 'Dashboard error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db'); // your MySQL connection
const bodyParser = require('body-parser');

router.use(bodyParser.json());

// Save a chat message
router.post('/save', async (req, res) => {
    const { from, to, text, timestamp } = req.body;
    if (!from || !to || !text || !timestamp) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await db.query(
            'INSERT INTO chat_messages (sender_id, receiver_id, message, timestamp) VALUES (?, ?, ?, ?)',
            [from, to, text, timestamp]
        );
        res.status(200).json({ message: 'Message saved' });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get chat history between two users
router.get('/history/:me/:them', async (req, res) => {
    const { me, them } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT sender_id AS \`from\`, receiver_id AS \`to\`, message AS text, timestamp 
             FROM chat_messages 
             WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
             ORDER BY id ASC`,
            [me, them, them, me]
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticate = require('../middleware/auth');

// // ✅ Update student name only
// router.put('/:id', authenticate, async (req, res) => {
//     const { name } = req.body;
//     const { id } = req.params;

//     if (!name) {
//         return res.status(400).json({ message: 'Name is required' });
//     }

//     try {
//         const [result] = await db.promise().query(
//             'UPDATE students SET name = ? WHERE id = ?',
//             [name, id]
//         );

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         res.json({ message: 'Profile updated successfully' });
//     } catch (err) {
//         console.error('Update error:', err);
//         res.status(500).json({ message: 'Error updating profile' });
//     }
// });


// ✅ Delete student
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.promise().query('DELETE FROM students WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or already deleted' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Error deleting account' });
    }
});

module.exports = router;

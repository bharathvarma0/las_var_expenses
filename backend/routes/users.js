const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, avatar_color } = req.body;
    await pool.query(
      'UPDATE users SET name=$1, avatar_color=$2 WHERE id=$3',
      [name, avatar_color, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

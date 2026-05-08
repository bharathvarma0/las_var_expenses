const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});

router.patch('/:id', (req, res) => {
  const { name, avatar_color } = req.body;
  db.prepare('UPDATE users SET name = ?, avatar_color = ? WHERE id = ?')
    .run(name, avatar_color, req.params.id);
  res.json({ success: true });
});

module.exports = router;

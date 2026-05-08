const express = require('express');
const router = express.Router();
const db = require('../database');

// Get expenses for a user/month/year
router.get('/:userId/:year/:month', (req, res) => {
  const { userId, year, month } = req.params;
  const expenses = db.prepare(`
    SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ? AND e.year = ? AND e.month = ?
    ORDER BY e.date DESC, e.id DESC
  `).all(userId, year, month);
  res.json(expenses);
});

// Get all users' expenses for a month (for combined dashboard)
router.get('/all/:year/:month', (req, res) => {
  const { year, month } = req.params;
  const expenses = db.prepare(`
    SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
           u.name as user_name, u.avatar_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    JOIN users u ON e.user_id = u.id
    WHERE e.year = ? AND e.month = ?
    ORDER BY e.date DESC, e.id DESC
  `).all(year, month);
  res.json(expenses);
});

// Add expense
router.post('/', (req, res) => {
  const { user_id, category_id, amount, name, date } = req.body;
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  const result = db.prepare(`
    INSERT INTO expenses (user_id, category_id, amount, name, date, month, year)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(user_id, category_id, amount, name, date, month, year);

  res.json({ success: true, id: result.lastInsertRowid });
});

// Delete expense
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Category summary for a user/month/year
router.get('/summary/:userId/:year/:month', (req, res) => {
  const { userId, year, month } = req.params;
  const summary = db.prepare(`
    SELECT c.id, c.name, c.icon, c.color,
           COALESCE(SUM(e.amount), 0) as spent
    FROM categories c
    LEFT JOIN expenses e ON c.id = e.category_id
      AND e.user_id = ? AND e.year = ? AND e.month = ?
    GROUP BY c.id
  `).all(userId, year, month);
  res.json(summary);
});

module.exports = router;

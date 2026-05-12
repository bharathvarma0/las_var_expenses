const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const COLORS = [
  '#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444',
  '#f97316','#06b6d4','#84cc16','#6b7280','#ec4899',
  '#14b8a6','#a855f7','#eab308','#64748b',
];

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });

    const { rows: existing } = await pool.query('SELECT color FROM categories');
    const usedColors = existing.map(c => c.color);
    const color = COLORS.find(c => !usedColors.includes(c)) || COLORS[Math.floor(Math.random() * COLORS.length)];

    const { rows } = await pool.query(
      'INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), '', color]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
    await pool.query('UPDATE categories SET name=$1 WHERE id=$2', [name.trim(), req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS n FROM expenses WHERE category_id=$1',
      [req.params.id]
    );
    if (parseInt(rows[0].n) > 0)
      return res.status(400).json({ error: 'Category has expenses, cannot delete' });

    await pool.query('DELETE FROM category_budgets WHERE category_id=$1', [req.params.id]);
    await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

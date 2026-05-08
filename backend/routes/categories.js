const express = require('express');
const router = express.Router();
const db = require('../database');

const COLORS = [
  '#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444',
  '#f97316','#06b6d4','#84cc16','#6b7280','#ec4899',
  '#14b8a6','#a855f7','#eab308','#64748b',
];

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY name').all());
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const all = db.prepare('SELECT color FROM categories').all().map(c => c.color);
  const color = COLORS.find(c => !all.includes(c)) || COLORS[Math.floor(Math.random() * COLORS.length)];
  const result = db.prepare('INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)').run(name.trim(), '', color);
  res.json({ id: result.lastInsertRowid, name: name.trim(), icon: '', color });
});

router.patch('/:id', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  // Check if category has expenses
  const count = db.prepare('SELECT COUNT(*) as n FROM expenses WHERE category_id = ?').get(req.params.id);
  if (count.n > 0) return res.status(400).json({ error: 'Category has expenses, cannot delete' });
  db.prepare('DELETE FROM category_budgets WHERE category_id = ?').run(req.params.id);
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

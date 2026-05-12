const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const { authenticateToken, validateUserAccess } = require('../middleware/auth');

// Helper — PostgreSQL returns NUMERIC as strings; convert to JS numbers
const parseRow = (r) => ({
  ...r,
  amount:           r.amount           != null ? parseFloat(r.amount)           : r.amount,
  spent:            r.spent            != null ? parseFloat(r.spent)            : r.spent,
  allocated_amount: r.allocated_amount != null ? parseFloat(r.allocated_amount) : r.allocated_amount,
});

// GET /api/expenses/:userId/:year/:month
router.get('/:userId/:year/:month', authenticateToken, validateUserAccess, async (req, res) => {
  try {
    const { userId, year, month } = req.params;
    const { rows } = await pool.query(`
      SELECT e.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id=$1 AND e.year=$2 AND e.month=$3
      ORDER BY e.date DESC, e.id DESC
    `, [userId, year, month]);
    res.json(rows.map(parseRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/all/:year/:month  (combined view for both users)
router.get('/all/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const { rows } = await pool.query(`
      SELECT e.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
             u.name AS user_name, u.avatar_color
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      JOIN users u ON e.user_id = u.id
      WHERE e.year=$1 AND e.month=$2
      ORDER BY e.date DESC, e.id DESC
    `, [year, month]);
    res.json(rows.map(parseRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses
router.post('/', authenticateToken, validateUserAccess, async (req, res) => {
  try {
    const { user_id, category_id, amount, name, date } = req.body;
    const d     = new Date(date);
    const month = d.getMonth() + 1;
    const year  = d.getFullYear();
    const safeAmount = Math.round(parseFloat(amount) * 100) / 100;

    const { rows } = await pool.query(`
      INSERT INTO expenses (user_id, category_id, amount, name, date, month, year)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id
    `, [user_id, category_id, safeAmount, name, date, month, year]);

    res.json({ success: true, id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/summary/:userId/:year/:month
router.get('/summary/:userId/:year/:month', authenticateToken, validateUserAccess, async (req, res) => {
  try {
    const { userId, year, month } = req.params;
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.icon, c.color,
             COALESCE(SUM(e.amount), 0) AS spent
      FROM categories c
      LEFT JOIN expenses e
        ON c.id = e.category_id
        AND e.user_id=$1 AND e.year=$2 AND e.month=$3
      GROUP BY c.id, c.name, c.icon, c.color
    `, [userId, year, month]);
    res.json(rows.map(parseRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

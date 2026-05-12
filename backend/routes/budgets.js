const express = require('express');
const router  = express.Router();
const { pool } = require('../database');
const { authenticateToken, validateUserAccess } = require('../middleware/auth');

// Helper: dynamically calculate opening_leftovers for a given month (live, not cached)
async function calcOpeningLeftovers(userId, year, month) {
  let prevMonth = month - 1;
  let prevYear  = year;
  if (prevMonth === 0) { prevMonth = 12; prevYear = year - 1; }

  const { rows } = await pool.query(
    'SELECT * FROM monthly_budgets WHERE user_id=$1 AND year=$2 AND month=$3',
    [userId, prevYear, prevMonth]
  );
  const prevBudget = rows[0];
  if (!prevBudget) return 0;

  const { rows: spent } = await pool.query(
    'SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE user_id=$1 AND year=$2 AND month=$3',
    [userId, prevYear, prevMonth]
  );

  const prevOpening = await calcOpeningLeftovers(userId, prevYear, prevMonth);
  return prevOpening + Number(prevBudget.total_income) - Number(spent[0].total);
}

// GET /api/budgets/:userId/:year/:month
router.get('/:userId/:year/:month', authenticateToken, validateUserAccess, async (req, res) => {
  try {
    const { userId, year, month } = req.params;

    const { rows } = await pool.query(
      'SELECT * FROM monthly_budgets WHERE user_id=$1 AND year=$2 AND month=$3',
      [userId, year, month]
    );
    if (!rows[0]) return res.json(null);
    const budget = rows[0];

    const { rows: categoryBudgets } = await pool.query(`
      SELECT cb.*, c.name, c.icon, c.color
      FROM category_budgets cb
      JOIN categories c ON cb.category_id = c.id
      WHERE cb.monthly_budget_id = $1
    `, [budget.id]);

    const opening_leftovers = await calcOpeningLeftovers(userId, parseInt(year), parseInt(month));

    res.json({
      ...budget,
      total_income:      parseFloat(budget.total_income),
      opening_leftovers: parseFloat(opening_leftovers),
      category_budgets:  categoryBudgets.map(cb => ({
        ...cb,
        allocated_amount: parseFloat(cb.allocated_amount),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets/:userId/:year/:month
router.post('/:userId/:year/:month', authenticateToken, validateUserAccess, async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, year, month } = req.params;
    const { total_income, category_budgets } = req.body;

    const safeIncome = Math.round(parseFloat(total_income) * 100) / 100;

    await client.query('BEGIN');

    const { rows: existing } = await client.query(
      'SELECT id, opening_leftovers FROM monthly_budgets WHERE user_id=$1 AND year=$2 AND month=$3',
      [userId, year, month]
    );

    let budgetId;
    let openingLeftovers;

    if (existing[0]) {
      openingLeftovers = Number(existing[0].opening_leftovers);
      await client.query(
        'UPDATE monthly_budgets SET total_income=$1 WHERE id=$2',
        [safeIncome, existing[0].id]
      );
      budgetId = existing[0].id;
    } else {
      openingLeftovers = await calcOpeningLeftovers(userId, parseInt(year), parseInt(month));
      const { rows: ins } = await client.query(
        'INSERT INTO monthly_budgets (user_id, month, year, total_income, opening_leftovers) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [userId, month, year, safeIncome, openingLeftovers]
      );
      budgetId = ins[0].id;
    }

    if (category_budgets && category_budgets.length > 0) {
      for (const { category_id, allocated_amount } of category_budgets) {
        const safeAmt = Math.round(parseFloat(allocated_amount) * 100) / 100;
        await client.query(`
          INSERT INTO category_budgets (monthly_budget_id, category_id, allocated_amount)
          VALUES ($1, $2, $3)
          ON CONFLICT (monthly_budget_id, category_id)
          DO UPDATE SET allocated_amount = EXCLUDED.allocated_amount
        `, [budgetId, category_id, safeAmt]);
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, budgetId, opening_leftovers: openingLeftovers });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;

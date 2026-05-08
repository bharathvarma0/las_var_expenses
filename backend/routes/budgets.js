const express = require('express');
const router = express.Router();
const db = require('../database');

// Get budget for a user/month/year
router.get('/:userId/:year/:month', (req, res) => {
  const { userId, year, month } = req.params;

  const budget = db.prepare(
    'SELECT * FROM monthly_budgets WHERE user_id = ? AND year = ? AND month = ?'
  ).get(userId, year, month);

  if (!budget) return res.json(null);

  const categoryBudgets = db.prepare(`
    SELECT cb.*, c.name, c.icon, c.color
    FROM category_budgets cb
    JOIN categories c ON cb.category_id = c.id
    WHERE cb.monthly_budget_id = ?
  `).all(budget.id);

  res.json({ ...budget, category_budgets: categoryBudgets });
});

// Create or update budget
router.post('/:userId/:year/:month', (req, res) => {
  const { userId, year, month } = req.params;
  const { total_income, category_budgets } = req.body;

  const existing = db.prepare(
    'SELECT id FROM monthly_budgets WHERE user_id = ? AND year = ? AND month = ?'
  ).get(userId, year, month);

  let budgetId;
  if (existing) {
    db.prepare('UPDATE monthly_budgets SET total_income = ? WHERE id = ?')
      .run(total_income, existing.id);
    budgetId = existing.id;
  } else {
    const result = db.prepare(
      'INSERT INTO monthly_budgets (user_id, month, year, total_income) VALUES (?, ?, ?, ?)'
    ).run(userId, month, year, total_income);
    budgetId = result.lastInsertRowid;
  }

  // Upsert category budgets
  if (category_budgets && category_budgets.length > 0) {
    const upsert = db.prepare(`
      INSERT INTO category_budgets (monthly_budget_id, category_id, allocated_amount)
      VALUES (?, ?, ?)
      ON CONFLICT(monthly_budget_id, category_id) DO UPDATE SET allocated_amount = excluded.allocated_amount
    `);
    const tx = db.transaction(() => {
      category_budgets.forEach(({ category_id, allocated_amount }) => {
        upsert.run(budgetId, category_id, allocated_amount);
      });
    });
    tx();
  }

  res.json({ success: true, budgetId });
});

module.exports = router;

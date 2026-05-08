const express = require('express');
const router = express.Router();
const db = require('../database');

// Helper: dynamically calculate opening_leftovers for a given month
// (chains back recursively through previous months)
function calcOpeningLeftovers(userId, year, month) {
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) { prevMonth = 12; prevYear = year - 1; }

  const prevBudget = db.prepare(
    'SELECT * FROM monthly_budgets WHERE user_id = ? AND year = ? AND month = ?'
  ).get(userId, prevYear, prevMonth);

  if (!prevBudget) return 0;

  const prevSpent = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE user_id = ? AND year = ? AND month = ?
  `).get(userId, prevYear, prevMonth);

  // Recursively get the opening_leftovers of the previous month
  const prevOpening = calcOpeningLeftovers(userId, prevYear, prevMonth);
  return prevOpening + prevBudget.total_income - (prevSpent.total || 0);
}

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

  // Always compute opening_leftovers live so it reflects the latest expense data
  const opening_leftovers = calcOpeningLeftovers(userId, parseInt(year), parseInt(month));

  res.json({ ...budget, opening_leftovers, category_budgets: categoryBudgets });
});


// Create or update budget
router.post('/:userId/:year/:month', (req, res) => {
  const { userId, year, month } = req.params;
  const { total_income, category_budgets } = req.body;

  const existing = db.prepare(
    'SELECT id, opening_leftovers FROM monthly_budgets WHERE user_id = ? AND year = ? AND month = ?'
  ).get(userId, year, month);

  let budgetId;
  let openingLeftovers;

  if (existing) {
    // Update existing - keep the same opening_leftovers
    openingLeftovers = existing.opening_leftovers;
    db.prepare('UPDATE monthly_budgets SET total_income = ? WHERE id = ?')
      .run(Math.round(total_income * 100) / 100, existing.id);
    budgetId = existing.id;
  } else {
    // New budget - calculate opening_leftovers from previous month
    openingLeftovers = calcOpeningLeftovers(userId, parseInt(year), parseInt(month));
    const result = db.prepare(
      'INSERT INTO monthly_budgets (user_id, month, year, total_income, opening_leftovers) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, month, year, Math.round(total_income * 100) / 100, openingLeftovers);
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
        upsert.run(budgetId, category_id, Math.round(allocated_amount * 100) / 100);
      });
    });
    tx();
  }

  res.json({ success: true, budgetId, opening_leftovers: openingLeftovers });
});

module.exports = router;

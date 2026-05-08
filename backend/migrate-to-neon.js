/**
 * Data Migration Script: SQLite → Neon (PostgreSQL)
 *
 * Run this ONCE locally before switching to Neon:
 *   node migrate-to-neon.js
 *
 * It reads your local expense_tracker.db and prints SQL INSERT
 * statements that you paste into the Neon SQL editor.
 */

const Database = require('better-sqlite3');
const path     = require('path');

const db = new Database(path.join(__dirname, 'expense_tracker.db'));

const lines = [];

const push = (sql) => lines.push(sql);

push('-- =============================================');
push('-- Neon migration export from expense_tracker.db');
push('-- Paste this into the Neon SQL editor');
push('-- =============================================\n');

// ── users ──────────────────────────────────────────────
push('-- USERS');
const users = db.prepare('SELECT * FROM users').all();
if (users.length) {
  for (const u of users) {
    push(
      `INSERT INTO users (id, name, avatar_color) VALUES (${u.id}, ${q(u.name)}, ${q(u.avatar_color)}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  // reset sequence
  push(`SELECT setval(pg_get_serial_sequence('users','id'), ${Math.max(...users.map(u => u.id))});\n`);
}

// ── categories ─────────────────────────────────────────
push('-- CATEGORIES');
const cats = db.prepare('SELECT * FROM categories').all();
if (cats.length) {
  for (const c of cats) {
    push(
      `INSERT INTO categories (id, name, icon, color) VALUES (${c.id}, ${q(c.name)}, ${q(c.icon)}, ${q(c.color)}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  push(`SELECT setval(pg_get_serial_sequence('categories','id'), ${Math.max(...cats.map(c => c.id))});\n`);
}

// ── monthly_budgets ────────────────────────────────────
push('-- MONTHLY BUDGETS');
const budgets = db.prepare('SELECT * FROM monthly_budgets').all();
if (budgets.length) {
  for (const b of budgets) {
    push(
      `INSERT INTO monthly_budgets (id, user_id, month, year, total_income, opening_leftovers) VALUES (${b.id}, ${b.user_id}, ${b.month}, ${b.year}, ${b.total_income}, ${b.opening_leftovers || 0}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  push(`SELECT setval(pg_get_serial_sequence('monthly_budgets','id'), ${Math.max(...budgets.map(b => b.id))});\n`);
}

// ── category_budgets ───────────────────────────────────
push('-- CATEGORY BUDGETS');
const catBudgets = db.prepare('SELECT * FROM category_budgets').all();
if (catBudgets.length) {
  for (const cb of catBudgets) {
    push(
      `INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (${cb.id}, ${cb.monthly_budget_id}, ${cb.category_id}, ${cb.allocated_amount}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  push(`SELECT setval(pg_get_serial_sequence('category_budgets','id'), ${Math.max(...catBudgets.map(cb => cb.id))});\n`);
}

// ── expenses ───────────────────────────────────────────
push('-- EXPENSES');
const expenses = db.prepare('SELECT * FROM expenses').all();
if (expenses.length) {
  for (const e of expenses) {
    push(
      `INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (${e.id}, ${e.user_id}, ${e.category_id}, ${e.amount}, ${q(e.name)}, ${q(e.date)}, ${e.month}, ${e.year}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  push(`SELECT setval(pg_get_serial_sequence('expenses','id'), ${Math.max(...expenses.map(e => e.id))});\n`);
}

push('-- Migration complete ✅');
console.log(lines.join('\n'));

function q(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

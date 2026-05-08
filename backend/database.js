const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'expense_tracker.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar_color TEXT NOT NULL DEFAULT '#6366f1'
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '💰',
    color TEXT NOT NULL DEFAULT '#6366f1'
  );

  CREATE TABLE IF NOT EXISTS monthly_budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_income REAL NOT NULL DEFAULT 0,
    opening_leftovers REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, month, year)
  );

  CREATE TABLE IF NOT EXISTS category_budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monthly_budget_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    allocated_amount REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (monthly_budget_id) REFERENCES monthly_budgets(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE(monthly_budget_id, category_id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

// Seed default users if none exist
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  db.prepare('INSERT INTO users (name, avatar_color) VALUES (?, ?)').run('Lasya', '#6366f1');
  db.prepare('INSERT INTO users (name, avatar_color) VALUES (?, ?)').run('Bharath', '#ec4899');
}

// Seed default categories if none exist
const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (catCount.count === 0) {
  const cats = [
    ['Housing', '#3b82f6'],
    ['Food & Dining', '#f59e0b'],
    ['Transport', '#10b981'],
    ['Shopping', '#8b5cf6'],
    ['Health', '#ef4444'],
    ['Entertainment', '#f97316'],
    ['Utilities', '#06b6d4'],
    ['Savings', '#84cc16'],
    ['Other', '#6b7280'],
  ];
  const insert = db.prepare('INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)');
  cats.forEach(([name, color]) => insert.run(name, '', color));
}

// Migration: Add opening_leftovers column if it doesn't exist
try {
  const tableInfo = db.prepare('PRAGMA table_info(monthly_budgets)').all();
  const hasLeftovers = tableInfo.some(col => col.name === 'opening_leftovers');
  if (!hasLeftovers) {
    db.prepare('ALTER TABLE monthly_budgets ADD COLUMN opening_leftovers REAL NOT NULL DEFAULT 0').run();
    console.log('✅ Added opening_leftovers column to monthly_budgets table');
  }
} catch (err) {
  console.error('Migration error:', err.message);
}

module.exports = db;

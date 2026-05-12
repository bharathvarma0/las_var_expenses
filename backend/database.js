const { Pool } = require('pg');

// DATABASE_URL → Supabase Transaction Pooler URL (port 6543)
// For local dev add to backend/.env:
//   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // always required on Supabase
  max: 1,                             // keep connections minimal for serverless
  idleTimeoutMillis: 10_000,
});

/**
 * Run all schema CREATE IF NOT EXISTS statements and seed default data.
 * Called once when the server starts.
 */
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id           SERIAL PRIMARY KEY,
        name         TEXT NOT NULL,
        avatar_color TEXT NOT NULL DEFAULT '#6366f1'
      );

      CREATE TABLE IF NOT EXISTS categories (
        id    SERIAL PRIMARY KEY,
        name  TEXT NOT NULL,
        icon  TEXT NOT NULL DEFAULT '',
        color TEXT NOT NULL DEFAULT '#6366f1'
      );

      CREATE TABLE IF NOT EXISTS monthly_budgets (
        id                SERIAL PRIMARY KEY,
        user_id           INTEGER NOT NULL REFERENCES users(id),
        month             INTEGER NOT NULL,
        year              INTEGER NOT NULL,
        total_income      NUMERIC(12,2) NOT NULL DEFAULT 0,
        opening_leftovers NUMERIC(12,2) NOT NULL DEFAULT 0,
        UNIQUE(user_id, month, year)
      );

      CREATE TABLE IF NOT EXISTS category_budgets (
        id                SERIAL PRIMARY KEY,
        monthly_budget_id INTEGER NOT NULL REFERENCES monthly_budgets(id),
        category_id       INTEGER NOT NULL REFERENCES categories(id),
        allocated_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
        UNIQUE(monthly_budget_id, category_id)
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id),
        category_id INTEGER NOT NULL REFERENCES categories(id),
        amount      NUMERIC(12,2) NOT NULL,
        name        TEXT NOT NULL,
        date        TEXT NOT NULL,
        month       INTEGER NOT NULL,
        year        INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS access_groups (
        id        SERIAL PRIMARY KEY,
        pin_hash  TEXT NOT NULL UNIQUE,
        user_ids  INTEGER[] NOT NULL,
        name      TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed default users only if table is empty
    const { rows: uc } = await client.query('SELECT COUNT(*) AS n FROM users');
    if (parseInt(uc[0].n) === 0) {
      await client.query(`
        INSERT INTO users (name, avatar_color) VALUES
          ('Lasya',  '#6366f1'),
          ('Bharath','#ec4899')
      `);
    }

    // Add Bhagavan if not already exists (for existing databases)
    const { rows: bhagavan } = await client.query('SELECT COUNT(*) AS n FROM users WHERE id = 3');
    if (parseInt(bhagavan[0].n) === 0) {
      await client.query(`
        INSERT INTO users (id, name, avatar_color) VALUES (3, 'Bhagavan', '#22c55e')
        ON CONFLICT (id) DO NOTHING
      `);
    }

    // Seed default categories only if table is empty
    const { rows: cc } = await client.query('SELECT COUNT(*) AS n FROM categories');
    if (parseInt(cc[0].n) === 0) {
      await client.query(`
        INSERT INTO categories (name, icon, color) VALUES
          ('Housing',       '', '#3b82f6'),
          ('Food & Dining', '', '#f59e0b'),
          ('Transport',     '', '#10b981'),
          ('Shopping',      '', '#8b5cf6'),
          ('Health',        '', '#ef4444'),
          ('Entertainment', '', '#f97316'),
          ('Utilities',     '', '#06b6d4'),
          ('Savings',       '', '#84cc16'),
          ('Other',         '', '#6b7280')
      `);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DB init error:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };

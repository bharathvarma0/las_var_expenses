-- =============================================
-- Neon migration export from expense_tracker.db
-- Paste this into the Neon SQL editor
-- =============================================

-- USERS
INSERT INTO users (id, name, avatar_color) VALUES (1, 'Lasya', '#6366f1') ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, name, avatar_color) VALUES (2, 'Bharath', '#ec4899') ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('users','id'), 2);

-- CATEGORIES
INSERT INTO categories (id, name, icon, color) VALUES (10, 'Housing', '', '#3b82f6') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (11, 'Food & Dining', '', '#f59e0b') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (12, 'Transport', '', '#10b981') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (13, 'Shopping', '', '#8b5cf6') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (14, 'Health', '', '#ef4444') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (15, 'Entertainment', '', '#f97316') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (16, 'Utilities', '', '#06b6d4') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (17, 'Savings', '', '#84cc16') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (18, 'Other', '', '#6b7280') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (19, 'EMIs', '', '#ec4899') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (20, 'SIPs', '', '#14b8a6') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (21, 'Fuel', '', '#a855f7') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (22, 'Electricity', '', '#eab308') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (23, 'Subscriptions', '', '#64748b') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (24, 'Groceries', '', '#fb7185') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (25, 'Loans', '', '#7c3aed') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, icon, color) VALUES (26, 'Education', '', '#0ea5e9') ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('categories','id'), 26);

-- MONTHLY BUDGETS
INSERT INTO monthly_budgets (id, user_id, month, year, total_income, opening_leftovers) VALUES (1, 1, 5, 2026, 45000, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO monthly_budgets (id, user_id, month, year, total_income, opening_leftovers) VALUES (2, 2, 5, 2026, 45000, 0) ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('monthly_budgets','id'), 2);

-- CATEGORY BUDGETS
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (1, 1, 10, 10000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (2, 1, 19, 10000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (4, 1, 11, 3000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (5, 1, 12, 5000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (6, 1, 13, 3000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (7, 1, 15, 3000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (9, 1, 23, 1000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (10, 1, 26, 9998) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (11, 2, 10, 14000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (12, 2, 11, 3000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (13, 2, 13, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (14, 2, 15, 8000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (15, 2, 17, 4800) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (16, 2, 18, 2502) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (17, 2, 19, 2600) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (18, 2, 20, 5000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (19, 2, 21, 2000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (20, 2, 22, 1000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (21, 2, 23, 1000) ON CONFLICT (id) DO NOTHING;
INSERT INTO category_budgets (id, monthly_budget_id, category_id, allocated_amount) VALUES (22, 2, 24, 1000) ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('category_budgets','id'), 22);

-- EXPENSES
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (1, 1, 19, 10000, 'against iphone and airpods', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (2, 1, 26, 9997.96, 'against education', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (3, 1, 10, 9999.95, 'against housing', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (4, 2, 19, 2600, 'slice', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (5, 2, 11, 60, 'curries may 7', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (6, 2, 15, 1979, 'mirragio bag', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (7, 2, 15, 300, 'rameswaram cafe', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (8, 2, 21, 500, 'fuel may 7', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (9, 2, 24, 70, 'soda, water may 7', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (10, 1, 11, 140, 'juice', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (11, 1, 11, 435, 'chopsticks', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (12, 1, 12, 69, 'metro may 7 mrng', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (13, 1, 12, 69, 'metro may 8 mrng', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (14, 2, 10, 14000, 'rent paid', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (15, 2, 15, 100, 'popcorn amb', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (16, 2, 15, 1200, 'bottle and makeup amb', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
INSERT INTO expenses (id, user_id, category_id, amount, name, date, month, year) VALUES (17, 2, 15, 135, 'tiffin and lassi', '2026-05-08', 5, 2026) ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('expenses','id'), 17);

-- Migration complete ✅

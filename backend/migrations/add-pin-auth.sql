-- =============================================
-- PIN-based authentication migration
-- Run this after the initial migration
-- =============================================

-- Add new user Bhagavan
INSERT INTO users (id, name, avatar_color) VALUES (3, 'Bhagavan', '#22c55e') ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('users','id'), 3);

-- Create access_groups table for PIN-based access control
CREATE TABLE IF NOT EXISTS access_groups (
  id        SERIAL PRIMARY KEY,
  pin_hash  TEXT NOT NULL UNIQUE,
  user_ids  INTEGER[] NOT NULL,
  name      TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Note: PINs will be inserted via the setup script
-- This keeps the hashed PINs out of version control

-- Migration complete ✅

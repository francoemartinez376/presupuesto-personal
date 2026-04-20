-- Correr esto en Supabase → SQL Editor

-- Tabla de datos del presupuesto por usuario
CREATE TABLE IF NOT EXISTS user_state (
  id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_state DISABLE ROW LEVEL SECURITY;

-- Tabla de usuarios con login
CREATE TABLE IF NOT EXISTS auth_users (
  username TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  user_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE auth_users DISABLE ROW LEVEL SECURITY;

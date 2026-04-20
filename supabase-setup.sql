-- Correr esto en Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS user_state (
  id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deshabilitar RLS (acceso solo desde server-side con service key)
ALTER TABLE user_state DISABLE ROW LEVEL SECURITY;

-- Insertar fila inicial vacía para Franco
INSERT INTO user_state (id, state) VALUES ('franco', '{}')
ON CONFLICT (id) DO NOTHING;

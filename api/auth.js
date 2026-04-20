import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function hash(password, salt) {
  return crypto.createHash('sha256').update(password + salt + 'pp_secret_2026').digest('hex');
}

function genCode(n = 12) {
  return crypto.randomBytes(n).toString('hex').substring(0, n);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, username, password } = req.body || {};
  if (!username?.trim() || !password?.trim())
    return res.status(400).json({ error: 'Completá usuario y contraseña' });

  const user = username.toLowerCase().trim();
  const displayName = username.trim();

  // ── REGISTRO ──
  if (action === 'register') {
    const { data: existing } = await supabase
      .from('auth_users')
      .select('username')
      .eq('username', user)
      .maybeSingle();

    if (existing) return res.status(409).json({ error: 'Ese nombre de usuario ya está en uso, elegí otro' });

    const salt = genCode(16);
    const passwordHash = hash(password, salt);
    const userCode = genCode(12);

    const { error } = await supabase.from('auth_users').insert({
      username: user,
      display_name: displayName,
      password_hash: passwordHash,
      salt,
      user_code: userCode,
    });
    if (error) return res.status(500).json({ error: 'Error al crear cuenta: ' + error.message });

    // Crear fila inicial en user_state
    await supabase.from('user_state').upsert({
      id: userCode,
      state: {},
      updated_at: new Date().toISOString()
    });

    return res.status(200).json({ ok: true, userCode, displayName });
  }

  // ── LOGIN ──
  if (action === 'login') {
    const { data: found, error } = await supabase
      .from('auth_users')
      .select('*')
      .eq('username', user)
      .maybeSingle();

    if (error || !found)
      return res.status(401).json({ error: 'Usuario no encontrado' });

    const passwordHash = hash(password, found.salt);
    if (passwordHash !== found.password_hash)
      return res.status(401).json({ error: 'Contraseña incorrecta' });

    return res.status(200).json({ ok: true, userCode: found.user_code, displayName: found.display_name });
  }

  return res.status(400).json({ error: 'Acción inválida' });
}

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // El user ID viene del query param ?u=CODIGO_SECRETO
  const userId = req.query.u;
  if (!userId || userId.length < 4) {
    return res.status(400).json({ error: 'Missing or invalid user code' });
  }

  // GET — cargar estado
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('user_state')
        .select('state')
        .eq('id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return res.status(200).json(data?.state ?? null);
    } catch (e) {
      console.error('GET error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  // POST — guardar estado
  if (req.method === 'POST') {
    try {
      const state = req.body;
      const { error } = await supabase
        .from('user_state')
        .upsert({ id: userId, state, updated_at: new Date().toISOString() });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('POST error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

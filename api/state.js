import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const USER_ID = 'franco';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — cargar estado
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('user_state')
        .select('state')
        .eq('id', USER_ID)
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
        .upsert({ id: USER_ID, state, updated_at: new Date().toISOString() });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('POST error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

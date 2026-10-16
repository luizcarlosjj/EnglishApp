import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error: dbErr } = await supabase
      .from('sessions')
      .select('id, scenario_code, evaluation, help_count, duration_seconds, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (dbErr) return res.status(500).json({ error: dbErr.message });
    return res.json(data || []);
  }

  if (req.method === 'POST') {
    const { data, error: dbErr } = await supabase
      .from('sessions')
      .insert({ ...req.body, user_id: user.id })
      .select()
      .single();
    if (dbErr) return res.status(500).json({ error: dbErr.message });
    return res.json(data);
  }

  res.status(405).end();
}

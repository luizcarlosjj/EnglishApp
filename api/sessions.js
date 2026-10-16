import { requireAuth, supabase } from './_lib/auth.js';

const ALLOWED_INSERT_FIELDS = ['scenario_code', 'transcript', 'evaluation', 'engagement_log', 'help_count', 'duration_seconds'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, scenario_code, evaluation, help_count, duration_seconds, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return res.status(500).json({ error: 'Failed to load sessions' });
    return res.json(data || []);
  }

  if (req.method === 'POST') {
    const payload = { user_id: user.id };
    for (const field of ALLOWED_INSERT_FIELDS) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert(payload)
      .select()
      .single();
    if (error) return res.status(500).json({ error: 'Failed to save session' });
    return res.json(data);
  }

  res.status(405).end();
}

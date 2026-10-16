import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function mergeConsecutiveRoles(messages) {
  const result = [];
  for (const msg of messages) {
    const last = result[result.length - 1];
    if (last && last.role === msg.role) {
      last.content += '\n' + msg.content;
    } else {
      result.push({ role: msg.role, content: msg.content });
    }
  }
  return result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { tier, messages } = req.body;
  if (!tier || !messages) return res.status(400).json({ error: 'Missing tier or messages' });

  const model = tier === 'evaluator' ? 'gpt-4o' : 'gpt-4o-mini';
  const maxTokens = tier === 'evaluator' ? 2500 : 600;
  const temperature = tier === 'evaluator' ? 0.3 : 0.85;

  const normalized = mergeConsecutiveRoles(messages);

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: normalized,
      max_tokens: maxTokens,
      temperature,
    });
    res.json({ content: completion.choices[0].message.content });
  } catch (e) {
    console.error('OpenAI error:', e.message);
    res.status(500).json({ error: 'AI error', details: e.message });
  }
}

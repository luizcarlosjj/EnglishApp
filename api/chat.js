import OpenAI from 'openai';
import { requireAuth } from './_lib/auth.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VALID_TIERS = new Set(['persona', 'helper', 'evaluator']);
const MAX_MESSAGES = 100;
const MAX_CONTENT_LENGTH = 10_000;

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

  const user = await requireAuth(req, res);
  if (!user) return;

  const { tier, messages } = req.body;

  if (!VALID_TIERS.has(tier)) {
    return res.status(400).json({ error: 'Invalid tier' });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages' });
  }
  if (messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: 'Too many messages' });
  }
  if (messages.some(m => typeof m?.role !== 'string' || typeof m?.content !== 'string' || m.content.length > MAX_CONTENT_LENGTH)) {
    return res.status(400).json({ error: 'Invalid message format or content too long' });
  }

  const model = tier === 'evaluator' ? 'gpt-4o' : 'gpt-4o-mini';
  const maxTokens = tier === 'evaluator' ? 2500 : 600;
  const temperature = tier === 'evaluator' ? 0.3 : 0.85;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: mergeConsecutiveRoles(messages),
      max_tokens: maxTokens,
      temperature,
    });
    res.json({ content: completion.choices[0].message.content });
  } catch (e) {
    console.error('OpenAI error:', e.message);
    res.status(500).json({ error: 'AI service unavailable' });
  }
}

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { requireAuth } from '@/lib/supabase/server'
import { mergeConsecutiveRoles } from '@/lib/utils'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const VALID_TIERS = new Set(['persona', 'helper', 'evaluator'])
const MAX_MESSAGES = 100
const MAX_CONTENT_LENGTH = 10_000

// Per-user rate limiting: 30 requests/minute (in-memory, per-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60_000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// Periodically clean up expired entries to avoid memory leaks
if (rateLimitMap.size > 500) {
  const now = Date.now()
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key)
  }
}

export async function POST(request: Request) {
  const { user, error: authError } = await requireAuth(request)
  if (!user) return authError!

  if (!checkRateLimit(user.id)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Wait a moment.' }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { tier, messages } = body

  if (!VALID_TIERS.has(tier)) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  if (!Array.isArray(messages) || messages.length === 0) return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
  if (messages.length > MAX_MESSAGES) return NextResponse.json({ error: 'Too many messages' }, { status: 400 })
  if (messages.some((m: { role?: unknown; content?: unknown }) => typeof m?.role !== 'string' || typeof m?.content !== 'string' || (m.content as string).length > MAX_CONTENT_LENGTH)) {
    return NextResponse.json({ error: 'Invalid message format' }, { status: 400 })
  }

  const model = tier === 'evaluator' ? 'gpt-4o' : 'gpt-4o-mini'
  const maxTokens = tier === 'evaluator' ? 2500 : 600
  const temperature = tier === 'evaluator' ? 0.3 : 0.85

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: mergeConsecutiveRoles(messages) as ChatCompletionMessageParam[],
      max_tokens: maxTokens,
      temperature,
    })
    return NextResponse.json({ content: completion.choices[0].message.content })
  } catch (e: unknown) {
    const err = e as Error
    console.error('OpenAI error:', err.message)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}

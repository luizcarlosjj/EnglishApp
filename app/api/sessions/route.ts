import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/server'

const ALLOWED_INSERT_FIELDS = ['scenario_code', 'transcript', 'evaluation', 'engagement_log', 'help_count', 'duration_seconds']

export async function GET(request: Request) {
  const { user, supabase, error: authError } = await requireAuth(request)
  if (!user) return authError!

  const { data, error } = await supabase!
    .from('sessions')
    .select('id, scenario_code, evaluation, help_count, duration_seconds, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const { user, supabase, error: authError } = await requireAuth(request)
  if (!user) return authError!

  const body = await request.json().catch(() => ({}))
  const payload: Record<string, unknown> = { user_id: user.id }
  for (const field of ALLOWED_INSERT_FIELDS) {
    if (body[field] !== undefined) payload[field] = body[field]
  }

  const { data, error } = await supabase!
    .from('sessions')
    .insert(payload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  return NextResponse.json(data)
}

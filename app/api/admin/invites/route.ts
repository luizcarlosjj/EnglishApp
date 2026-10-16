import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { user, supabase, error } = await requireAdmin(request)
  if (!user) return error!

  const { data, error: dbErr } = await supabase
    .from('invites')
    .select('id, token, label, used_by, used_at, revoked, created_at')
    .order('created_at', { ascending: false })

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { user, supabase, error } = await requireAdmin(request)
  if (!user) return error!

  const body = await request.json().catch(() => ({}))
  const label = (body.label as string | undefined)?.trim() || null
  const token = crypto.randomUUID()

  const { data, error: dbErr } = await supabase
    .from('invites')
    .insert({ token, label, created_by: user.id })
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json({ invite: data })
}

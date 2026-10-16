import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { user, supabase, error } = await requireAdmin(request)
  if (!user) return error!

  const { token } = await params

  const { error: dbErr } = await supabase
    .from('invites')
    .update({ revoked: true })
    .eq('token', token)
    .eq('revoked', false)

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

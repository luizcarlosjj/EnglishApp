import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { token, email, password } = body as { token?: string; email?: string; password?: string }
  if (!token || !email || !password) return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: 'Senha precisa ter pelo menos 8 caracteres.' }, { status: 400 })

  const supabase = getAdminClient()

  const { data: invite, error: invErr } = await supabase
    .from('invites')
    .select('id, revoked, used_by')
    .eq('token', token)
    .single()

  if (invErr || !invite) return NextResponse.json({ error: 'Link inválido.' }, { status: 400 })
  if (invite.revoked) return NextResponse.json({ error: 'Este link foi revogado.' }, { status: 400 })
  if (invite.used_by) return NextResponse.json({ error: 'Este link já foi utilizado.' }, { status: 400 })

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  })

  if (createErr) {
    const msg = createErr.message.includes('already') ? 'Este email já está cadastrado.' : createErr.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  await supabase.from('invites').update({
    used_by: created.user.id,
    used_at: new Date().toISOString(),
  }).eq('token', token)

  return NextResponse.json({ ok: true })
}

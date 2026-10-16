import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  // Authenticate the requesting user
  const { user, error: authError } = await requireAuth(request)
  if (!user) return authError!

  // app_metadata can only be set via the service role key — users cannot forge it
  if (!user.app_metadata?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 })
  }

  const email = String(body.email).trim().toLowerCase()
  const password = String(body.password)
  const displayName = body.display_name ? String(body.display_name).trim().slice(0, 60) : ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Senha precisa ter pelo menos 8 caracteres.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: displayName ? { display_name: displayName } : {},
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    id: data.user.id,
    email: data.user.email,
    created_at: data.user.created_at,
  }, { status: 201 })
}

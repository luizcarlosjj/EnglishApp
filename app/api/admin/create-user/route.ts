import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin-only endpoint for creating new users safely.
// Requires the ADMIN_SECRET env var in the x-admin-secret header.
// This avoids sharing the Supabase dashboard with others.
//
// Usage:
//   curl -X POST https://your-domain.com/api/admin/create-user \
//     -H "x-admin-secret: YOUR_ADMIN_SECRET" \
//     -H "Content-Type: application/json" \
//     -d '{"email":"user@example.com","password":"tempPass123","display_name":"User Name"}'

export async function POST(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return NextResponse.json({ error: 'Admin endpoint not configured' }, { status: 503 })
  }

  const provided = request.headers.get('x-admin-secret')
  if (!provided || provided !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
  }

  const email = String(body.email).trim().toLowerCase()
  const password = String(body.password)
  const displayName = body.display_name ? String(body.display_name).trim() : ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
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

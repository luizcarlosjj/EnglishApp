import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function requireAuth(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return { user: null, supabase: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const supabase = getServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return { user: null, supabase: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { user, supabase, error: null }
}

export async function requireAdmin(request: Request) {
  const { user, supabase, error } = await requireAuth(request)
  if (!user) return { user: null, supabase: null, error }
  if (!user.app_metadata?.is_admin) {
    return { user: null, supabase: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user, supabase: supabase!, error: null }
}

export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

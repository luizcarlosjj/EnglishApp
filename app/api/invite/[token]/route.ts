import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = getAdminClient()

  const { data } = await supabase
    .from('invites')
    .select('revoked, used_by')
    .eq('token', token)
    .single()

  if (!data) return NextResponse.json({ valid: false, reason: 'Link inválido ou expirado.' })
  if (data.revoked) return NextResponse.json({ valid: false, reason: 'Este link foi revogado pelo administrador.' })
  if (data.used_by) return NextResponse.json({ valid: false, reason: 'Este link já foi utilizado.' })

  return NextResponse.json({ valid: true })
}

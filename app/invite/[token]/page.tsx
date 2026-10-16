'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const [invalidReason, setInvalidReason] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    params.then(({ token: t }) => {
      setToken(t)
      fetch(`/api/invite/${t}`)
        .then(r => r.json())
        .then(data => {
          if (data.valid) setStatus('valid')
          else { setStatus('invalid'); setInvalidReason(data.reason || 'Link inválido.') }
        })
        .catch(() => { setStatus('invalid'); setInvalidReason('Erro ao verificar o link.') })
    })
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!email.trim()) { setFormError('Informe seu email.'); return }
    if (password.length < 8) { setFormError('Senha precisa ter pelo menos 8 caracteres.'); return }
    if (password !== confirmPw) { setFormError('As senhas não coincidem.'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/invite/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error || 'Erro ao criar conta.'); setSubmitting(false); return }

      const supabase = getSupabaseClient()
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (signInErr) { router.push('/login'); return }
      router.push('/scenarios')
    } catch {
      setFormError('Erro de rede. Tente novamente.')
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full bg-wa-dark">
        <div className="w-8 h-8 border-2 border-wa-dark3 border-t-wa-green rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-wa-dark px-6 text-center gap-4">
        <div className="text-5xl">🔗</div>
        <h1 className="text-lg font-bold text-white">Link inválido</h1>
        <p className="text-sm text-wa-sub">{invalidReason}</p>
        <p className="text-xs text-wa-sub">Peça um novo link ao administrador.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-wa-dark">
      <div className="bg-wa-dark2 border-b border-wa-border px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-wa-green/10 border border-wa-green/30 flex items-center justify-center text-xl">🎓</div>
          <div>
            <h1 className="text-base font-bold text-white">Criar sua conta</h1>
            <p className="text-xs text-wa-sub">English Practice App</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <p className="text-sm text-[#c9d1d9] mb-6 leading-relaxed">
          Você foi convidado para acessar o simulador de conversas em inglês. Crie sua conta abaixo para começar.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs text-wa-sub mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" autoComplete="email"
              className="w-full bg-wa-dark2 border border-wa-border rounded-xl px-4 py-3 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-wa-sub mb-1.5">Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres" autoComplete="new-password"
              className="w-full bg-wa-dark2 border border-wa-border rounded-xl px-4 py-3 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-wa-sub mb-1.5">Confirmar senha</label>
            <input
              type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              placeholder="Repita a senha" autoComplete="new-password"
              className="w-full bg-wa-dark2 border border-wa-border rounded-xl px-4 py-3 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
            />
          </div>

          {formError && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-xl">
              {formError}
            </div>
          )}

          <button
            type="submit" disabled={submitting}
            className="w-full bg-wa-green text-wa-dark font-bold py-3.5 rounded-xl text-sm hover:bg-wa-teal transition-colors disabled:opacity-50 mt-1"
          >
            {submitting ? 'Criando conta…' : 'Criar conta e entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

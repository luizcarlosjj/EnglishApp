'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const { signIn, user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/scenarios')
  }, [user, loading, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Preencha email e senha.'); return }
    setSubmitting(true)
    setError('')
    const err = await signIn(email, password)
    if (err) { setError(err); setSubmitting(false) }
    else router.push('/scenarios')
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8 bg-wa-dark">
      <div className="w-24 h-24 bg-wa-green rounded-full flex items-center justify-center text-5xl">💬</div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Simulador de Inglês</h1>
        <p className="text-wa-sub mt-1 text-sm max-w-xs">Entre para praticar inglês em conversas reais.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-xs">
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email" autoComplete="email"
          className="bg-wa-dark2 border border-[#444] rounded-xl px-4 py-3.5 text-white placeholder-wa-sub text-sm outline-none focus:border-wa-teal transition-colors"
        />
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Senha" autoComplete="current-password"
          className="bg-wa-dark2 border border-[#444] rounded-xl px-4 py-3.5 text-white placeholder-wa-sub text-sm outline-none focus:border-wa-teal transition-colors"
        />
        <button
          type="submit" disabled={submitting}
          className="bg-wa-green text-white py-3.5 rounded-3xl font-semibold text-base hover:bg-wa-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Entrando…' : 'Entrar →'}
        </button>
      </form>
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </div>
  )
}

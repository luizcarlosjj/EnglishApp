'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { BottomNav } from '@/components/layout/BottomNav'

type Tab = 'account' | 'preferences' | 'admin'

const FEEDBACK_LANG_KEY = 'eng_feedback_lang'
const SOUND_KEY = 'eng_sound_enabled'

export default function ProfilePage() {
  const { user, loading, token, signOut, changePassword, updateDisplayName } = useAuth()
  const router = useRouter()

  const isAdmin = !!(user?.app_metadata?.is_admin)
  const [tab, setTab] = useState<Tab>('account')

  // Account
  const [displayName, setDisplayName] = useState('')
  const [nameStatus, setNameStatus] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwStatus, setPwStatus] = useState('')
  const [pwSubmitting, setPwSubmitting] = useState(false)

  // Preferences
  const [feedbackLang, setFeedbackLang] = useState<'pt' | 'en'>('pt')
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Admin — create user
  const [newEmail, setNewEmail] = useState('')
  const [newUserPw, setNewUserPw] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [createStatus, setCreateStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return }
    if (user) setDisplayName((user.user_metadata?.display_name as string) || '')
    try {
      if (localStorage.getItem(FEEDBACK_LANG_KEY) === 'en') setFeedbackLang('en')
      if (localStorage.getItem(SOUND_KEY) === '1') setSoundEnabled(true)
    } catch {}
  }, [user, loading, router])

  async function handleSaveName() {
    if (!displayName.trim()) return
    const err = await updateDisplayName(displayName)
    setNameStatus(err ? `Erro: ${err}` : 'Nome atualizado!')
    setTimeout(() => setNameStatus(''), 3000)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPw || !confirmPw) { setPwStatus('Preencha todos os campos.'); return }
    if (newPw !== confirmPw) { setPwStatus('As senhas não coincidem.'); return }
    if (newPw.length < 8) { setPwStatus('Mínimo 8 caracteres.'); return }
    setPwSubmitting(true); setPwStatus('')
    const err = await changePassword(newPw)
    if (err) setPwStatus(`Erro: ${err}`)
    else { setPwStatus('Senha alterada!'); setNewPw(''); setConfirmPw('') }
    setPwSubmitting(false)
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreateStatus(null)
    if (!newEmail || !newUserPw) { setCreateStatus({ ok: false, msg: 'Preencha email e senha.' }); return }
    if (newUserPw.length < 8) { setCreateStatus({ ok: false, msg: 'Senha precisa ter pelo menos 8 caracteres.' }); return }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newEmail, password: newUserPw, display_name: newUserName }),
      })
      const data = await res.json()
      if (!res.ok) setCreateStatus({ ok: false, msg: data.error || 'Erro desconhecido.' })
      else {
        setCreateStatus({ ok: true, msg: `Usuário ${data.email} criado com sucesso!` })
        setNewEmail(''); setNewUserPw(''); setNewUserName('')
      }
    } catch {
      setCreateStatus({ ok: false, msg: 'Erro de rede.' })
    }
    setCreating(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-wa-dark">
      <div className="w-8 h-8 border-2 border-wa-dark3 border-t-wa-green rounded-full animate-spin" />
    </div>
  )

  const tabs: { key: Tab; label: string }[] = [
    { key: 'account', label: 'Conta' },
    { key: 'preferences', label: 'Preferências' },
    ...(isAdmin ? [{ key: 'admin' as Tab, label: '⚙️ Admin' }] : []),
  ]

  return (
    <div className="flex flex-col h-full bg-wa-dark">
      {/* Header */}
      <div className="bg-wa-dark2 border-b border-wa-border px-5 py-4 flex-shrink-0">
        <h1 className="text-xl font-bold">Perfil</h1>
      </div>

      {/* Avatar + email */}
      <div className="bg-wa-dark2 border-b border-wa-border px-5 py-4 flex items-center gap-4 flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-wa-dark3 border-2 border-wa-green/30 flex items-center justify-center text-2xl flex-shrink-0 font-bold text-wa-green">
          {displayName ? displayName[0].toUpperCase() : (user?.email?.[0].toUpperCase() ?? '?')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate">{displayName || 'Usuário'}</div>
          <div className="text-wa-sub text-xs truncate">{user?.email}</div>
          {isAdmin && <div className="text-[10px] text-wa-green font-semibold mt-0.5 uppercase tracking-wide">Admin</div>}
        </div>
        <button
          onClick={signOut}
          className="text-xs text-wa-sub hover:text-red-400 transition-colors px-3 py-1.5 border border-wa-border rounded-lg flex-shrink-0"
        >
          Sair
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="bg-wa-dark2 flex border-b border-wa-border flex-shrink-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
              tab === t.key ? 'text-wa-green border-wa-green' : 'text-wa-sub border-transparent hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* ── CONTA ── */}
        {tab === 'account' && (
          <>
            <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Nome de exibição</h2>
              <div className="flex gap-2">
                <input
                  type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="Seu nome" maxLength={40}
                  className="flex-1 bg-wa-dark3 border border-wa-border rounded-lg px-3 py-2 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
                />
                <button onClick={handleSaveName}
                  className="bg-wa-green text-wa-dark font-semibold text-sm px-4 py-2 rounded-lg hover:bg-wa-teal transition-colors">
                  Salvar
                </button>
              </div>
              {nameStatus && <p className={`text-xs mt-2 ${nameStatus.startsWith('Erro') ? 'text-red-400' : 'text-wa-green'}`}>{nameStatus}</p>}
            </section>

            <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Alterar senha</h2>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-2.5">
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="Nova senha (mín. 8 caracteres)" autoComplete="new-password"
                  className="bg-wa-dark3 border border-wa-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
                />
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Confirmar nova senha" autoComplete="new-password"
                  className="bg-wa-dark3 border border-wa-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
                />
                <button type="submit" disabled={pwSubmitting}
                  className="bg-wa-dark3 border border-wa-border text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-wa-dark transition-colors disabled:opacity-50">
                  {pwSubmitting ? 'Salvando…' : 'Alterar senha'}
                </button>
              </form>
              {pwStatus && (
                <p className={`text-xs mt-2 ${pwStatus.startsWith('Senha alterada') ? 'text-wa-green' : 'text-red-400'}`}>{pwStatus}</p>
              )}
            </section>
          </>
        )}

        {/* ── PREFERÊNCIAS ── */}
        {tab === 'preferences' && (
          <>
            <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-1">Idioma do feedback</h2>
              <p className="text-xs text-wa-sub mb-3">Como as correções aparecem na avaliação.</p>
              <div className="flex gap-2">
                {(['pt', 'en'] as const).map(lang => (
                  <button key={lang} onClick={() => { setFeedbackLang(lang); try { localStorage.setItem(FEEDBACK_LANG_KEY, lang) } catch {} }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      feedbackLang === lang ? 'bg-wa-green/10 border-wa-green text-wa-green' : 'bg-wa-dark3 border-wa-border text-wa-sub hover:text-white'
                    }`}>
                    {lang === 'pt' ? '🇧🇷 Português' : '🇺🇸 English'}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Sons de notificação</h2>
                  <p className="text-xs text-wa-sub mt-0.5">Efeito sonoro ao receber mensagem</p>
                </div>
                <button onClick={() => { const n = !soundEnabled; setSoundEnabled(n); try { localStorage.setItem(SOUND_KEY, n ? '1' : '0') } catch {} }}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${soundEnabled ? 'bg-wa-green' : 'bg-wa-dark3 border border-wa-border'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </section>

            <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-wa-sub">Versão do app</span>
                <span className="text-xs text-wa-sub font-mono">1.0.0</span>
              </div>
            </section>
          </>
        )}

        {/* ── ADMIN ── */}
        {tab === 'admin' && isAdmin && (
          <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-1">Criar novo usuário</h2>
            <p className="text-xs text-wa-sub mb-4">O usuário recebe acesso imediato com o email e senha definidos aqui.</p>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
              <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)}
                placeholder="Nome (opcional)" maxLength={60}
                className="bg-wa-dark3 border border-wa-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
              />
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                placeholder="Email" autoComplete="off"
                className="bg-wa-dark3 border border-wa-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
              />
              <input type="text" value={newUserPw} onChange={e => setNewUserPw(e.target.value)}
                placeholder="Senha (mín. 8 caracteres)" autoComplete="off"
                className="bg-wa-dark3 border border-wa-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors font-mono tracking-wide"
              />
              <p className="text-[11px] text-wa-sub -mt-1">Use texto visível — você precisa enviar essa senha ao usuário.</p>
              <button type="submit" disabled={creating}
                className="bg-wa-green text-wa-dark font-semibold text-sm py-3 rounded-lg hover:bg-wa-teal transition-colors disabled:opacity-50">
                {creating ? 'Criando…' : 'Criar usuário'}
              </button>
            </form>
            {createStatus && (
              <div className={`mt-3 text-xs px-3 py-2.5 rounded-lg ${createStatus.ok ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                {createStatus.msg}
              </div>
            )}
          </section>
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  )
}

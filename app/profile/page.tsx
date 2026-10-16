'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { BottomNav } from '@/components/layout/BottomNav'

type Tab = 'account' | 'preferences'

const FEEDBACK_LANG_KEY = 'eng_feedback_lang'
const SOUND_KEY = 'eng_sound_enabled'

export default function ProfilePage() {
  const { user, loading, signOut, changePassword, updateDisplayName } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('account')

  // Account
  const [displayName, setDisplayName] = useState('')
  const [nameStatus, setNameStatus] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwStatus, setPwStatus] = useState('')
  const [pwSubmitting, setPwSubmitting] = useState(false)

  // Preferences
  const [feedbackLang, setFeedbackLang] = useState<'pt' | 'en'>('pt')
  const [soundEnabled, setSoundEnabled] = useState(false)

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return }
    if (user) {
      setDisplayName((user.user_metadata?.display_name as string) || '')
    }
    try {
      const lang = localStorage.getItem(FEEDBACK_LANG_KEY)
      if (lang === 'en') setFeedbackLang('en')
      const sound = localStorage.getItem(SOUND_KEY)
      if (sound === '1') setSoundEnabled(true)
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
    if (newPw.length < 8) { setPwStatus('A senha precisa ter pelo menos 8 caracteres.'); return }
    setPwSubmitting(true)
    setPwStatus('')
    const err = await changePassword(newPw)
    if (err) setPwStatus(`Erro: ${err}`)
    else {
      setPwStatus('Senha alterada com sucesso!')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    }
    setPwSubmitting(false)
  }

  function saveFeedbackLang(val: 'pt' | 'en') {
    setFeedbackLang(val)
    try { localStorage.setItem(FEEDBACK_LANG_KEY, val) } catch {}
  }

  function toggleSound() {
    const next = !soundEnabled
    setSoundEnabled(next)
    try { localStorage.setItem(SOUND_KEY, next ? '1' : '0') } catch {}
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-wa-dark">
      <div className="w-8 h-8 border-2 border-wa-dark3 border-t-wa-green rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-wa-dark">
      {/* Header */}
      <div className="bg-wa-dark2 border-b border-wa-border px-5 py-4 flex-shrink-0">
        <h1 className="text-xl font-bold">Perfil</h1>
      </div>

      {/* Avatar + email */}
      <div className="bg-wa-dark2 border-b border-wa-border px-5 py-4 flex items-center gap-4 flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-wa-dark3 border-2 border-wa-green/30 flex items-center justify-center text-2xl flex-shrink-0">
          {displayName ? displayName[0].toUpperCase() : '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate">{displayName || 'Usuário'}</div>
          <div className="text-wa-sub text-xs truncate">{user?.email}</div>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-wa-sub hover:text-red-400 transition-colors px-3 py-1.5 border border-wa-border rounded-lg"
        >
          Sair
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="bg-wa-dark2 flex border-b border-wa-border flex-shrink-0">
        {(['account', 'preferences'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
              tab === t ? 'text-wa-green border-wa-green' : 'text-wa-sub border-transparent hover:text-white'
            }`}
          >
            {t === 'account' ? 'Conta' : 'Preferências'}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {tab === 'account' && (
          <>
            {/* Display name */}
            <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Nome de exibição</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Seu nome"
                  maxLength={40}
                  className="flex-1 bg-wa-dark3 border border-wa-border rounded-lg px-3 py-2 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
                />
                <button
                  onClick={handleSaveName}
                  className="bg-wa-green text-wa-dark font-semibold text-sm px-4 py-2 rounded-lg hover:bg-wa-teal transition-colors"
                >
                  Salvar
                </button>
              </div>
              {nameStatus && (
                <p className={`text-xs mt-2 ${nameStatus.startsWith('Erro') ? 'text-red-400' : 'text-wa-green'}`}>
                  {nameStatus}
                </p>
              )}
            </section>

            {/* Change password */}
            <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Alterar senha</h2>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-2.5">
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Nova senha (mín. 8 caracteres)"
                  autoComplete="new-password"
                  className="bg-wa-dark3 border border-wa-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
                />
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Confirmar nova senha"
                  autoComplete="new-password"
                  className="bg-wa-dark3 border border-wa-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
                />
                <button
                  type="submit"
                  disabled={pwSubmitting}
                  className="bg-wa-dark3 border border-wa-border text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-wa-dark transition-colors disabled:opacity-50"
                >
                  {pwSubmitting ? 'Salvando…' : 'Alterar senha'}
                </button>
              </form>
              {pwStatus && (
                <p className={`text-xs mt-2 ${pwStatus.startsWith('Erro') || pwStatus.startsWith('As') || pwStatus.startsWith('A senha') || pwStatus.startsWith('Preencha') ? 'text-red-400' : 'text-wa-green'}`}>
                  {pwStatus}
                </p>
              )}
            </section>
          </>
        )}

        {tab === 'preferences' && (
          <>
            {/* Feedback language */}
            <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-1">Idioma do feedback</h2>
              <p className="text-xs text-wa-sub mb-3">Como as correções e explicações são apresentadas na avaliação.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => saveFeedbackLang('pt')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    feedbackLang === 'pt'
                      ? 'bg-wa-green/10 border-wa-green text-wa-green'
                      : 'bg-wa-dark3 border-wa-border text-wa-sub hover:text-white'
                  }`}
                >
                  🇧🇷 Português
                </button>
                <button
                  onClick={() => saveFeedbackLang('en')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    feedbackLang === 'en'
                      ? 'bg-wa-green/10 border-wa-green text-wa-green'
                      : 'bg-wa-dark3 border-wa-border text-wa-sub hover:text-white'
                  }`}
                >
                  🇺🇸 English
                </button>
              </div>
            </section>

            {/* Sound */}
            <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Sons de notificação</h2>
                  <p className="text-xs text-wa-sub mt-0.5">Efeito sonoro ao receber mensagem</p>
                </div>
                <button
                  onClick={toggleSound}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${soundEnabled ? 'bg-wa-green' : 'bg-wa-dark3 border border-wa-border'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </section>

            {/* App version */}
            <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-wa-sub">Versão do app</span>
                <span className="text-xs text-wa-sub font-mono">1.0.0</span>
              </div>
            </section>
          </>
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  )
}

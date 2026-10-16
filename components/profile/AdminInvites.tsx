'use client'
import { useState, useEffect, useCallback } from 'react'

interface Invite {
  id: string
  token: string
  label: string | null
  used_by: string | null
  used_at: string | null
  revoked: boolean
  created_at: string
}

function InviteStatus({ invite }: { invite: Invite }) {
  if (invite.revoked) return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-950 text-red-400">Revogado</span>
  if (invite.used_by) return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-green-950 text-green-400">Usado</span>
  return <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-yellow-950 text-yellow-400">Pendente</span>
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props { token: string }

export function AdminInvites({ token: authToken }: Props) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState('')
  const [generating, setGenerating] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/invites', { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(data => { setInvites(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [authToken])

  useEffect(() => { load() }, [load])

  async function handleGenerate() {
    setGenerating(true)
    setNewUrl('')
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ label }),
      })
      const data = await res.json()
      if (res.ok) {
        const url = `${window.location.origin}/invite/${data.invite.token}`
        setNewUrl(url)
        setLabel('')
        load()
      }
    } catch { /* ignore */ }
    setGenerating(false)
  }

  async function handleRevoke(inviteToken: string) {
    if (!confirm('Revogar este link? Ele deixará de funcionar imediatamente.')) return
    setRevoking(inviteToken)
    await fetch(`/api/admin/invites/${inviteToken}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    setRevoking(null)
    load()
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Generate */}
      <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-1">Gerar link de acesso</h2>
        <p className="text-xs text-wa-sub mb-3">O convidado usa o link para criar a própria conta com email e senha.</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text" value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Rótulo (ex: João da Silva)" maxLength={80}
            className="flex-1 bg-wa-dark3 border border-wa-border rounded-lg px-3 py-2 text-sm text-white placeholder-wa-sub outline-none focus:border-wa-green transition-colors"
          />
          <button
            onClick={handleGenerate} disabled={generating}
            className="bg-wa-green text-wa-dark font-semibold text-sm px-4 py-2 rounded-lg hover:bg-wa-teal transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {generating ? '…' : 'Gerar'}
          </button>
        </div>

        {newUrl && (
          <div className="bg-wa-dark3 border border-wa-green/30 rounded-lg px-3 py-2.5 flex items-center gap-2">
            <span className="flex-1 text-xs text-wa-green break-all font-mono">{newUrl}</span>
            <button
              onClick={() => copyUrl(newUrl)}
              className="flex-shrink-0 text-xs text-wa-sub hover:text-white transition-colors px-2 py-1 border border-wa-border rounded"
            >
              {copied ? '✓' : 'Copiar'}
            </button>
          </div>
        )}
      </section>

      {/* List */}
      <section className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Links gerados</h2>
        {loading && <div className="text-xs text-wa-sub py-2">Carregando…</div>}
        {!loading && invites.length === 0 && (
          <div className="text-xs text-wa-sub py-2">Nenhum link gerado ainda.</div>
        )}
        {!loading && invites.length > 0 && (
          <div className="flex flex-col gap-2">
            {invites.map(inv => {
              const isPending = !inv.revoked && !inv.used_by
              const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${inv.token}`
              return (
                <div key={inv.id} className="border border-wa-border rounded-lg px-3 py-2.5 flex items-start gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm text-white truncate">{inv.label || <span className="text-wa-sub italic">sem rótulo</span>}</span>
                      <InviteStatus invite={inv} />
                    </div>
                    <div className="text-[11px] text-wa-sub">{fmtDate(inv.created_at)}</div>
                    {inv.used_at && <div className="text-[11px] text-wa-sub">Usado em {fmtDate(inv.used_at)}</div>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
                    {isPending && (
                      <>
                        <button
                          onClick={() => copyUrl(url)}
                          title="Copiar link"
                          className="p-1.5 text-wa-sub hover:text-wa-green transition-colors border border-wa-border rounded-md"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRevoke(inv.token)}
                          disabled={revoking === inv.token}
                          title="Revogar link"
                          className="p-1.5 text-wa-sub hover:text-red-400 transition-colors border border-wa-border rounded-md disabled:opacity-50"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { fetchSessions } from '@/lib/api'
import { SCENARIOS } from '@/lib/scenarios'
import { formatDate } from '@/lib/utils'
import type { Session } from '@/lib/types'
import { BottomNav } from '@/components/layout/BottomNav'

const levelColors: Record<string, string> = {
  beginner: 'bg-green-950 text-green-400',
  intermediate: 'bg-yellow-950 text-yellow-400',
  challenging: 'bg-red-950 text-red-400',
}

export default function ProgressPage() {
  const { user, loading, token } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [fetching, setFetching] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return }
    if (!loading && user && token) {
      fetchSessions(token)
        .then(data => { setSessions(data); setFetching(false) })
        .catch(() => { setFetchError('Erro ao carregar histórico.'); setFetching(false) })
    }
  }, [user, loading, token, router])

  const scores = sessions.map(s => s.evaluation?.nota_geral ?? 0).filter(Boolean)
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const best = scores.length ? Math.max(...scores) : 0

  // SVG chart data
  const chartPts = scores.slice(0, 20).reverse()
  const w = 400
  const h = 100

  function buildChart() {
    if (chartPts.length < 2) return null
    const stepX = w / (chartPts.length - 1)
    const points = chartPts.map((v, i) => `${i * stepX},${h - (v / 100 * h)}`).join(' ')
    return (
      <>
        <polyline points={points} fill="none" stroke="#25D366" strokeWidth="2.5" />
        {chartPts.map((v, i) => (
          <circle key={i} cx={i * stepX} cy={h - (v / 100 * h)} r={3} fill="#25D366" />
        ))}
      </>
    )
  }

  return (
    <div className="flex flex-col h-full bg-wa-dark">
      {/* Header */}
      <div className="bg-wa-dark2 border-b border-wa-border px-5 py-4 flex items-center flex-shrink-0">
        <h1 className="text-xl font-bold">Meu Progresso</h1>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {fetching && (
          <div className="text-center text-wa-sub py-10 text-sm">Carregando…</div>
        )}
        {fetchError && !fetching && (
          <div className="text-center text-red-400 py-10 text-sm">{fetchError}</div>
        )}
        {!fetching && !fetchError && sessions.length === 0 && (
          <div className="text-center py-16 text-wa-sub">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">Nenhuma conversa ainda.<br />Conclua um cenário para ver seu progresso aqui!</p>
          </div>
        )}
        {!fetching && !fetchError && sessions.length > 0 && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="bg-wa-dark2 rounded-xl p-3.5 text-center">
                <div className="text-2xl font-bold text-wa-green">{sessions.length}</div>
                <div className="text-xs text-wa-sub mt-1">Conversas</div>
              </div>
              <div className="bg-wa-dark2 rounded-xl p-3.5 text-center">
                <div className="text-2xl font-bold text-wa-green">{avg || '–'}</div>
                <div className="text-xs text-wa-sub mt-1">Média</div>
              </div>
              <div className="bg-wa-dark2 rounded-xl p-3.5 text-center">
                <div className="text-2xl font-bold text-wa-green">{best || '–'}</div>
                <div className="text-xs text-wa-sub mt-1">Melhor Nota</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-wa-dark2 rounded-xl p-4 mb-4">
              <h3 className="text-wa-sub text-sm font-semibold mb-3">Evolução das notas</h3>
              <svg width="100%" height="100" viewBox="0 0 400 100" preserveAspectRatio="none">
                {chartPts.length >= 2 ? buildChart() : (
                  <text x="50%" y="55%" textAnchor="middle" fill="#667781" fontSize="13">
                    Conclua mais cenários para ver seu gráfico de progresso
                  </text>
                )}
              </svg>
            </div>

            {/* History list */}
            <div className="flex flex-col gap-2">
              {sessions.map(s => {
                const sc = SCENARIOS.find(x => x.code === s.scenario_code)
                const score = s.evaluation?.nota_geral
                const date = formatDate(s.created_at)
                const level = s.evaluation?.nivel_estimado || ''
                const duration = s.duration_seconds ? Math.round(s.duration_seconds / 60) + 'min' : '–'
                return (
                  <div key={s.id} className="bg-wa-dark2 rounded-xl p-3.5 hover:bg-wa-dark3 transition-colors">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-[22px]">{sc?.emoji || '💬'}</span>
                      <span className="font-semibold text-sm flex-1 text-white">{sc?.title || s.scenario_code}</span>
                      <span className="text-base font-bold text-wa-green">{score || '–'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-wa-sub">
                      <span>{date}</span>
                      {level && (
                        <span className="bg-wa-dark3 px-1.5 py-0.5 rounded text-[11px]">{level}</span>
                      )}
                      <span>{duration}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <BottomNav active="progress" />
    </div>
  )
}

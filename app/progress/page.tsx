'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { fetchSessions } from '@/lib/api'
import { SCENARIOS } from '@/lib/scenarios'
import { formatDate } from '@/lib/utils'
import type { Session } from '@/lib/types'
import { BottomNav } from '@/components/layout/BottomNav'

function scoreColor(score: number) {
  if (score >= 75) return 'text-green-400'
  if (score >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

function scoreBg(score: number) {
  if (score >= 75) return 'bg-green-950 border-green-800'
  if (score >= 50) return 'bg-yellow-950 border-yellow-800'
  return 'bg-red-950 border-red-800'
}

function fmtDuration(secs: number) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  return m > 0 ? `${m} min` : `${secs}s`
}

function fmtTotalTime(secs: number) {
  if (!secs) return '–'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m} min`
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
  const totalSecs = sessions.reduce((a, s) => a + (s.duration_seconds || 0), 0)

  // Chart — last 15 sessions, oldest → newest
  const chartPts = scores.slice(0, 15).reverse()

  function buildChart() {
    const W = 400, H = 90, PAD = 4
    const step = chartPts.length > 1 ? (W - PAD * 2) / (chartPts.length - 1) : 0
    const y = (v: number) => PAD + (H - PAD * 2) * (1 - v / 100)
    const pts = chartPts.map((v, i) => `${PAD + i * step},${y(v)}`).join(' ')

    // area fill points
    const areaFirst = `${PAD},${H}`
    const areaLast = `${PAD + (chartPts.length - 1) * step},${H}`
    const areaPath = `${areaFirst} ${pts} ${areaLast}`

    // grid lines at 25, 50, 75
    const gridLines = [25, 50, 75].map(val => ({
      y: y(val),
      label: String(val),
    }))

    return (
      <>
        {/* grid */}
        {gridLines.map(g => (
          <g key={g.label}>
            <line x1={PAD} y1={g.y} x2={W - PAD} y2={g.y} stroke="#21262D" strokeWidth="1"/>
            <text x={W - 2} y={g.y + 4} textAnchor="end" fill="#7D8590" fontSize="9">{g.label}</text>
          </g>
        ))}
        {/* area */}
        <polygon points={areaPath} fill="#2DD4BF" fillOpacity="0.07"/>
        {/* line */}
        <polyline points={pts} fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinejoin="round"/>
        {/* dots */}
        {chartPts.map((v, i) => (
          <circle key={i} cx={PAD + i * step} cy={y(v)} r="3.5" fill="#2DD4BF" stroke="#161B22" strokeWidth="1.5"/>
        ))}
      </>
    )
  }

  return (
    <div className="flex flex-col h-full bg-wa-dark">
      {/* Header */}
      <div className="bg-wa-dark2 border-b border-wa-border px-5 py-4 flex-shrink-0">
        <h1 className="text-xl font-bold">Meu Progresso</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {fetching && (
          <div className="flex items-center justify-center py-20 text-wa-sub text-sm">Carregando…</div>
        )}
        {fetchError && !fetching && (
          <div className="text-center text-red-400 py-20 text-sm">{fetchError}</div>
        )}
        {!fetching && !fetchError && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-wa-sub text-center px-8">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-sm leading-relaxed">Nenhuma conversa concluída ainda.<br/>Complete um cenário para ver seu progresso aqui.</p>
          </div>
        )}

        {!fetching && !fetchError && sessions.length > 0 && (
          <div className="p-4 flex flex-col gap-4">

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Conversas" value={sessions.length} sub="concluídas" />
              <StatCard label="Tempo total" value={fmtTotalTime(totalSecs)} />
              <StatCard label="Nota média" value={avg || '–'} sub={avg ? '/100' : undefined}
                valueClass={avg ? scoreColor(avg) : 'text-wa-sub'} />
              <StatCard label="Melhor nota" value={best || '–'} sub={best ? '/100' : undefined}
                valueClass={best ? scoreColor(best) : 'text-wa-sub'} />
            </div>

            {/* Chart */}
            {chartPts.length >= 2 && (
              <div className="bg-wa-dark2 border border-wa-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Evolução das notas</h3>
                  <span className="text-xs text-wa-sub">{chartPts.length} sessões</span>
                </div>
                <svg width="100%" height="90" viewBox="0 0 400 90" preserveAspectRatio="none">
                  {buildChart()}
                </svg>
                <div className="flex justify-between mt-2 text-[10px] text-wa-sub">
                  <span>mais antigo</span>
                  <span>mais recente</span>
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2.5">Histórico</h3>
              <div className="flex flex-col gap-2">
                {sessions.map(s => {
                  const sc = SCENARIOS.find(x => x.code === s.scenario_code)
                  const score = s.evaluation?.nota_geral
                  const dur = fmtDuration(s.duration_seconds)
                  const date = formatDate(s.created_at)
                  const objective = s.evaluation?.objetivo_alcancado

                  return (
                    <div key={s.id} className="bg-wa-dark2 border border-wa-border rounded-xl p-3.5 flex gap-3 items-start">
                      {/* Emoji */}
                      <div className="text-2xl leading-none flex-shrink-0 mt-0.5">
                        {sc?.emoji || '💬'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white leading-snug">
                          {sc?.title_pt || s.scenario_code}
                        </div>
                        <div className="text-wa-sub text-[11px] italic mb-1.5">{sc?.title}</div>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-wa-sub">
                          <span>{date}</span>
                          {dur && <><span>·</span><span>{dur}</span></>}
                          {objective !== undefined && (
                            <><span>·</span>
                            <span className={objective ? 'text-green-400' : 'text-yellow-500'}>
                              {objective ? '🎯 objetivo' : '😅 incompleto'}
                            </span></>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      {score != null && (
                        <div className={`flex-shrink-0 w-11 h-11 rounded-xl border flex flex-col items-center justify-center ${scoreBg(score)}`}>
                          <span className={`text-base font-bold leading-none ${scoreColor(score)}`}>{score}</span>
                          <span className={`text-[9px] leading-none mt-0.5 ${scoreColor(score)} opacity-70`}>/100</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav active="progress" />
    </div>
  )
}

function StatCard({
  label, value, sub, valueClass = 'text-wa-green',
}: {
  label: string
  value: string | number
  sub?: string
  valueClass?: string
}) {
  return (
    <div className="bg-wa-dark2 border border-wa-border rounded-xl p-3.5">
      <div className="text-xs text-wa-sub mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${valueClass}`}>{value}</span>
        {sub && <span className="text-xs text-wa-sub">{sub}</span>}
      </div>
    </div>
  )
}

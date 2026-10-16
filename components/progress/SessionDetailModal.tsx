'use client'
import type { Session } from '@/lib/types'
import { SCENARIOS } from '@/lib/scenarios'
import { formatDate } from '@/lib/utils'

const SCORE_LABELS: Record<string, string> = {
  gramatica: 'Gramática',
  vocabulario: 'Vocabulário',
  naturalidade: 'Naturalidade',
  clareza: 'Clareza',
  tom_adequado: 'Tom adequado',
}

function scoreColor(n: number) {
  if (n >= 75) return 'bg-green-500'
  if (n >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function scoreText(n: number) {
  if (n >= 75) return 'text-green-400'
  if (n >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-wa-sub w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-wa-dark3 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${scoreColor(value)}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-semibold w-7 text-right ${scoreText(value)}`}>{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-wa-border pt-4">
      <h3 className="text-xs font-semibold text-wa-sub uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  )
}

interface Props {
  session: Session
  onClose: () => void
}

export function SessionDetailModal({ session, onClose }: Props) {
  const ev = session.evaluation
  const sc = SCENARIOS.find(s => s.code === session.scenario_code)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-wa-dark" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      {/* Header */}
      <div className="bg-wa-dark2 border-b border-wa-border px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
        <button onClick={onClose} className="text-wa-sub hover:text-white transition-colors p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className="text-xl">{sc?.emoji || '💬'}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-white leading-tight truncate">{sc?.title_pt || session.scenario_code}</div>
          <div className="text-[11px] text-wa-sub">{formatDate(session.created_at)}</div>
        </div>
        {ev?.nota_geral != null && (
          <div className={`flex-shrink-0 text-xl font-bold ${scoreText(ev.nota_geral)}`}>
            {ev.nota_geral}
            <span className="text-xs text-wa-sub font-normal">/100</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {!ev && (
          <div className="text-center text-wa-sub text-sm py-10">Sem avaliação para esta sessão.</div>
        )}

        {ev && (
          <>
            {/* Objective + level */}
            <div className="flex gap-3">
              <div className={`flex-1 rounded-xl p-3 border text-sm font-medium text-center ${
                ev.objetivo_alcancado ? 'bg-green-950 border-green-800 text-green-300' : 'bg-yellow-950 border-yellow-800 text-yellow-300'
              }`}>
                {ev.objetivo_alcancado ? '🎯 Objetivo alcançado' : '😅 Objetivo não alcançado'}
              </div>
              {ev.nivel_estimado && (
                <div className="flex-1 bg-wa-dark2 border border-wa-border rounded-xl p-3 text-sm text-center">
                  <div className="text-wa-sub text-[10px] uppercase tracking-widest">Nível</div>
                  <div className="text-white font-bold">{ev.nivel_estimado}</div>
                </div>
              )}
            </div>

            {/* Summary */}
            {ev.resumo && (
              <Section title="Resumo">
                <p className="text-sm text-[#c9d1d9] leading-relaxed">{ev.resumo}</p>
              </Section>
            )}

            {/* Sub-scores */}
            {ev.notas && (
              <Section title="Notas por categoria">
                <div className="flex flex-col gap-2.5">
                  {(Object.entries(ev.notas) as [string, number][]).map(([key, val]) => (
                    <ScoreBar key={key} label={SCORE_LABELS[key] || key} value={val} />
                  ))}
                </div>
              </Section>
            )}

            {/* Strengths */}
            {ev.pontos_fortes?.length > 0 && (
              <Section title="Pontos fortes">
                <ul className="space-y-1.5">
                  {ev.pontos_fortes.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#c9d1d9]">
                      <span className="text-green-400 flex-shrink-0">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Improvements */}
            {ev.melhorias?.length > 0 && (
              <Section title="O que melhorar">
                <ul className="space-y-1.5">
                  {ev.melhorias.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#c9d1d9]">
                      <span className="text-yellow-400 flex-shrink-0">→</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Corrections */}
            {ev.correcoes?.length > 0 && (
              <Section title="Correções">
                <div className="flex flex-col gap-3">
                  {ev.correcoes.map((c, i) => (
                    <div key={i} className="bg-wa-dark2 rounded-xl p-3 border border-wa-border">
                      <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs bg-red-950 text-red-300 px-2 py-0.5 rounded line-through">{c.original}</span>
                        <span className="text-wa-sub text-xs">→</span>
                        <span className="text-xs bg-green-950 text-green-300 px-2 py-0.5 rounded">{c.corrigido}</span>
                      </div>
                      <p className="text-xs text-wa-sub leading-relaxed">{c.explicacao}</p>
                      {c.tipo && (
                        <span className="inline-block mt-1.5 text-[10px] text-wa-teal border border-wa-teal/30 rounded px-1.5 py-0.5">{c.tipo}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Natural alternatives */}
            {ev.jeito_mais_natural?.length > 0 && (
              <Section title="Jeito mais natural">
                <div className="flex flex-col gap-2">
                  {ev.jeito_mais_natural.map((n, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm flex-wrap">
                      <span className="text-[#8b949e] line-through">{n.original}</span>
                      <span className="text-wa-sub">→</span>
                      <span className="text-wa-green font-medium">{n.nativo_diria}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Vocabulary */}
            {(ev.vocab_usado?.length > 0 || ev.vocab_sugerido?.length > 0) && (
              <Section title="Vocabulário">
                {ev.vocab_usado?.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[11px] text-wa-sub mb-1.5">Usado na conversa</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ev.vocab_usado.map((w, i) => (
                        <span key={i} className="text-xs bg-wa-dark3 border border-wa-border text-[#c9d1d9] px-2 py-0.5 rounded-full">{w}</span>
                      ))}
                    </div>
                  </div>
                )}
                {ev.vocab_sugerido?.length > 0 && (
                  <div>
                    <div className="text-[11px] text-wa-sub mb-1.5">Para aprender a seguir</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ev.vocab_sugerido.map((w, i) => (
                        <span key={i} className="text-xs bg-wa-teal/10 border border-wa-teal/30 text-wa-teal px-2 py-0.5 rounded-full">{w}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Ideal conversation */}
            {ev.conversa_ideal && (
              <Section title="Como seria a conversa ideal">
                <p className="text-sm text-[#c9d1d9] leading-relaxed italic">{ev.conversa_ideal}</p>
              </Section>
            )}
          </>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}

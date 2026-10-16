'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useChatStore } from '@/hooks/useChat'
import { buildEvaluatorPrompt } from '@/lib/prompts'
import { callAPI, saveSession } from '@/lib/api'
import { SCORE_LABELS } from '@/lib/utils'
import type { Evaluation } from '@/lib/types'

export default function EvaluationPage() {
  const router = useRouter()
  const { token } = useAuth()
  const { scenario, messages, helpCount, engagementLog, startTime, reset } = useChatStore()

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function runEvaluation() {
    if (!scenario || !token) return
    setLoading(true)
    setError('')

    const transcript = messages.map(m =>
      `${m.role === 'user' ? 'STUDENT' : scenario.persona.name}: ${m.content}`
    ).join('\n')

    const prompt = buildEvaluatorPrompt(scenario, transcript, helpCount, engagementLog)

    try {
      const data = await callAPI('evaluator', [{ role: 'user', content: prompt }], token)
      const raw = data.content.replace(/```json?/g, '').replace(/```/g, '').trim()
      const ev: Evaluation = JSON.parse(raw)
      setEvaluation(ev)
      const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
      await saveSession({
        scenario_code: scenario.code,
        transcript: messages,
        evaluation: ev,
        engagement_log: engagementLog,
        help_count: helpCount,
        duration_seconds: duration,
      }, token)
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || 'Erro ao gerar avaliação.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!scenario) { router.replace('/scenarios'); return }
    const userMessages = messages.filter(m => m.role === 'user')
    if (userMessages.length === 0) { router.replace('/chat'); return }
    runEvaluation()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleReset() {
    reset()
    router.push('/scenarios')
  }

  function handleProgress() {
    reset()
    router.push('/progress')
  }

  if (!scenario) return null

  return (
    <div className="flex flex-col h-full bg-wa-dark">
      {/* Header */}
      <div className="bg-wa-dark2 px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <button onClick={handleReset} className="text-white">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <h1 className="text-lg font-bold flex-1">Sua Avaliação</h1>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-wa-sub">
            <div className="w-10 h-10 border-3 border-wa-dark3 border-t-wa-green rounded-full animate-spin" style={{ borderWidth: '3px' }} />
            <span className="text-sm">Analisando sua conversa…</span>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">Erro ao gerar avaliação.<br /><small className="text-wa-sub">{error}</small></p>
            <button onClick={runEvaluation} className="bg-wa-dark2 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-wa-dark3 transition-colors">
              Tentar novamente
            </button>
          </div>
        )}

        {evaluation && !loading && (
          <div className="flex flex-col gap-3">
            {/* Goal banner */}
            <div className={`rounded-xl px-4 py-3.5 text-sm font-semibold flex items-center gap-2.5 ${
              evaluation.objetivo_alcancado
                ? 'bg-green-950 text-green-400 border border-green-800'
                : 'bg-orange-950 text-orange-400 border border-orange-800'
            }`}>
              {evaluation.objetivo_alcancado ? '🎯 Objetivo alcançado!' : '😅 Objetivo não totalmente alcançado — tente este cenário novamente!'}
            </div>

            {/* Overall score */}
            <div className="bg-wa-dark2 rounded-xl p-4">
              <h2 className="text-wa-green font-bold text-sm mb-3">Nota Geral</h2>
              <div className="text-center">
                <span className="text-5xl font-bold text-wa-green">{evaluation.nota_geral}</span>
                <span className="text-xl text-wa-sub">/100</span>
              </div>
              <div className="text-center text-wa-sub text-sm mt-2">
                Nível estimado: <strong className="text-white">{evaluation.nivel_estimado}</strong>
              </div>
              <p className="text-[#ccc] text-sm leading-relaxed mt-3">{evaluation.resumo}</p>
            </div>

            {/* Score grid */}
            <div className="bg-wa-dark2 rounded-xl p-4">
              <h2 className="text-wa-green font-bold text-sm mb-3">Notas por Critério</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(evaluation.notas).map(([key, val]) => (
                  <div key={key} className="bg-wa-dark3 rounded-lg p-3 text-center">
                    <div className="text-xs text-wa-sub mb-1 capitalize">{SCORE_LABELS[key] || key}</div>
                    <div className="text-base tracking-wide">{'⭐'.repeat(val)}{'☆'.repeat(5 - val)}</div>
                    <div className="text-xs text-[#ccc] mt-0.5">{val}/5</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corrections */}
            <div className="bg-wa-dark2 rounded-xl p-4">
              <h2 className="text-wa-green font-bold text-sm mb-3">Correções</h2>
              {(evaluation.correcoes || []).length === 0 ? (
                <p className="text-wa-sub text-sm">Nenhum erro significativo encontrado!</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {evaluation.correcoes.map((c, i) => (
                    <div key={i} className="bg-wa-dark3 rounded-lg p-3">
                      <div className="text-red-400 text-sm mb-1">❌ &ldquo;{c.original}&rdquo;</div>
                      <div className="text-green-400 text-sm mb-1.5">✅ &ldquo;{c.corrigido}&rdquo;</div>
                      <div className="text-wa-sub text-xs leading-relaxed">
                        {c.explicacao}
                        <span className="ml-1.5 bg-wa-dark2 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide text-[#aaa]">{c.tipo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Natural phrasing */}
            <div className="bg-wa-dark2 rounded-xl p-4">
              <h2 className="text-wa-green font-bold text-sm mb-3">Como Dizer de Forma Mais Natural</h2>
              {(evaluation.jeito_mais_natural || []).length === 0 ? (
                <p className="text-wa-sub text-sm">Sua forma de falar já estava natural!</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {evaluation.jeito_mais_natural.map((j, i) => (
                    <div key={i} className="bg-wa-dark3 rounded-lg p-3 text-sm">
                      <div className="text-wa-sub mb-1">Você escreveu: <em>&ldquo;{j.original}&rdquo;</em></div>
                      <div className="text-green-400 font-medium">Um nativo diria: &ldquo;{j.nativo_diria}&rdquo;</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vocabulary */}
            <div className="bg-wa-dark2 rounded-xl p-4">
              <h2 className="text-wa-green font-bold text-sm mb-3">Vocabulário</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-wa-sub font-semibold mb-2">Usadas ✅</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(evaluation.vocab_usado || []).length === 0 ? (
                      <span className="text-wa-sub text-xs">nenhuma</span>
                    ) : evaluation.vocab_usado.map((w, i) => (
                      <span key={i} className="bg-green-950 text-green-400 px-2.5 py-1 rounded-full text-xs font-medium">{w}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-wa-sub font-semibold mb-2">Podia ter usado 💡</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(evaluation.vocab_sugerido || []).length === 0 ? (
                      <span className="text-wa-sub text-xs">—</span>
                    ) : evaluation.vocab_sugerido.map((w, i) => (
                      <span key={i} className="bg-blue-950 text-blue-300 px-2.5 py-1 rounded-full text-xs font-medium">{w}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths and improvements */}
            <div className="bg-wa-dark2 rounded-xl p-4">
              <h2 className="text-wa-green font-bold text-sm mb-3">Pontos Fortes</h2>
              <ul className="list-disc list-inside text-[#ccc] text-sm leading-loose space-y-0.5">
                {(evaluation.pontos_fortes || []).map((p, i) => <li key={i}>{p}</li>)}
              </ul>
              <h2 className="text-wa-green font-bold text-sm mt-4 mb-3">Pontos a Melhorar</h2>
              <ul className="list-disc list-inside text-[#ccc] text-sm leading-loose space-y-0.5">
                {(evaluation.melhorias || []).map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>

            {/* Ideal conversation */}
            <div className="bg-wa-dark2 rounded-xl p-4">
              <h2 className="text-wa-green font-bold text-sm mb-3">Como um Nativo Diria</h2>
              {!evaluation.conversa_ideal ? (
                <p className="text-wa-sub text-sm">—</p>
              ) : (
                <div className="flex flex-col gap-1.5 items-end">
                  {evaluation.conversa_ideal.split('|||').map((m, i) => m.trim()).filter(Boolean).map((m, i) => (
                    <div key={i} className="bg-wa-sent text-[#c8eaf4] rounded-lg rounded-tr-none px-3 py-2 text-sm max-w-[85%]">
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 mt-2 pb-6 flex-wrap">
              <button onClick={handleReset} className="flex-1 bg-wa-green text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-wa-teal transition-colors">
                Tentar outro cenário
              </button>
              <button onClick={handleProgress} className="flex-1 bg-wa-dark2 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-wa-dark3 transition-colors">
                Meu Progresso
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

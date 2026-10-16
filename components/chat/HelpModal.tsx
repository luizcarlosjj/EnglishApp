'use client'
import { useState } from 'react'
import type { Scenario } from '@/lib/types'
import { callAPI } from '@/lib/api'

interface Props {
  scenario: Scenario
  token: string
  onClose: () => void
  onSelect: (text: string) => void
  onHelpUsed: () => void
}

interface Suggestion { text: string; note: string }

export function HelpModal({ scenario, token, onClose, onSelect, onHelpUsed }: Props) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleTranslate() {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setSuggestions([])
    const prompt = `You are an English language tutor. The student wants to say the following in a WhatsApp conversation:
"${input}"

Context: they are in a ${scenario.level} level chat.

Give exactly 3 natural English options for saying this, from most casual to most formal. Return ONLY JSON array:
[{"text":"...","note":"brief note in Portuguese about register/tone"}]`
    try {
      const data = await callAPI('helper', [{ role: 'user', content: prompt }], token)
      const parsed = JSON.parse(data.content.replace(/```json?/g, '').replace(/```/g, '').trim())
      setSuggestions(parsed)
      onHelpUsed()
    } catch {
      setError('Erro ao buscar sugestões. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-wa-dark2 rounded-t-2xl w-full max-w-lg p-5 pb-8" style={{ animation: 'slideUp 0.25s ease' }}>
        <h2 className="font-bold text-lg mb-1">💡 Como digo em inglês…?</h2>
        <p className="text-wa-sub text-sm mb-3">Digite em português o que quer dizer. Vou te dar opções naturais em inglês.</p>
        <textarea
          value={input}
          onChange={e => {
            setInput(e.target.value)
            const el = e.target
            el.style.height = 'auto'
            el.style.height = el.scrollHeight + 'px'
          }}
          placeholder="Ex: quero dizer que não consigo comparecer amanhã…"
          rows={2}
          className="w-full bg-wa-dark3 border border-[#444] rounded-xl px-3.5 py-3 text-white text-sm resize-none outline-none focus:border-wa-teal placeholder-wa-sub"
        />
        {loading && <p className="text-wa-sub text-sm py-2">Buscando sugestões…</p>}
        {error && <p className="text-red-400 text-sm py-1">{error}</p>}
        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => onSelect(s.text)}
                className="bg-wa-dark3 hover:bg-[#333] border border-transparent hover:border-wa-teal rounded-lg p-3 cursor-pointer transition-all"
              >
                <div className="text-white font-medium text-sm">{i + 1}. &ldquo;{s.text}&rdquo;</div>
                {s.note && <div className="text-wa-sub text-xs mt-1">{s.note}</div>}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2.5 mt-4">
          <button onClick={handleTranslate} disabled={loading} className="flex-1 bg-wa-teal text-white py-3 rounded-xl font-semibold text-sm hover:bg-wa-header transition-colors disabled:opacity-50">
            Traduzir →
          </button>
          <button onClick={onClose} className="bg-wa-dark3 text-wa-sub px-5 py-3 rounded-xl text-sm hover:bg-wa-dark transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

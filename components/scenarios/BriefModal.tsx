'use client'
import type { Scenario } from '@/lib/types'
import { LEVEL_PT } from '@/lib/utils'

interface Props {
  scenario: Scenario
  onStart: () => void
  onClose: () => void
}

const levelColors: Record<string, string> = {
  beginner: 'bg-green-950 text-green-400',
  intermediate: 'bg-yellow-950 text-yellow-400',
  challenging: 'bg-red-950 text-red-400',
}

export function BriefModal({ scenario: s, onStart, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-wa-dark2 rounded-t-2xl w-full max-w-lg p-5 pb-8" style={{ animation: 'slideUp 0.25s ease' }}>
        <div className="text-center text-5xl mb-2">{s.emoji}</div>
        <h2 className="font-bold text-lg text-white mb-1">{s.title}</h2>
        <p className="text-wa-sub text-sm mb-3 leading-relaxed">{s.brief}</p>
        <div className="bg-wa-dark3 rounded-lg px-3 py-2.5 text-sm text-[#ccc] mb-3">
          <strong className="text-wa-green">Seu objetivo:</strong> {s.goal}
        </div>
        <div className="flex gap-2 mb-5 items-center">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${levelColors[s.level]}`}>
            {LEVEL_PT[s.level]}
          </span>
          <span className="text-xs text-wa-sub">{s.cefr} · {s.persona.name} ({s.persona.origin})</span>
        </div>
        <div className="flex gap-2.5">
          <button onClick={onStart} className="flex-1 bg-wa-teal hover:bg-wa-header text-white py-3 rounded-xl font-semibold text-sm transition-colors">
            Iniciar conversa →
          </button>
          <button onClick={onClose} className="bg-wa-dark3 text-wa-sub px-5 py-3 rounded-xl text-sm hover:bg-wa-dark transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

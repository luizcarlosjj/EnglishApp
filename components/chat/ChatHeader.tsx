'use client'
import type { Scenario } from '@/lib/types'

interface Props {
  scenario: Scenario
  isTyping: boolean
  ended: boolean
  onBack: () => void
  onToggleEngagement: () => void
  onFinish: () => void
}

export function ChatHeader({ scenario, isTyping, ended, onBack, onToggleEngagement, onFinish }: Props) {
  const status = ended ? 'conversa encerrada' : isTyping ? 'digitando…' : 'online'

  return (
    <div className="bg-wa-header px-3.5 py-2.5 flex items-center gap-2.5 flex-shrink-0 z-10">
      <button onClick={onBack} className="text-white p-1">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <div className="w-10 h-10 rounded-full bg-wa-teal flex items-center justify-center text-lg flex-shrink-0">
        {scenario.emoji}
      </div>
      <div className="flex-1">
        <div className="text-white font-semibold text-base leading-tight">{scenario.persona.name}</div>
        <div className="text-white/70 text-xs">{status}</div>
      </div>
      <button onClick={onToggleEngagement} className="text-white p-1.5 hover:bg-white/10 rounded-full transition-colors">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
      </button>
      {!ended && (
        <button onClick={onFinish} className="text-white text-xs px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors">
          ✓ Terminar
        </button>
      )}
    </div>
  )
}

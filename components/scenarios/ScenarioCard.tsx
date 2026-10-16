'use client'
import type { Scenario } from '@/lib/types'
import { LEVEL_PT } from '@/lib/utils'

const levelColors: Record<string, string> = {
  beginner: 'bg-green-950 text-green-400',
  intermediate: 'bg-yellow-950 text-yellow-400',
  challenging: 'bg-red-950 text-red-400',
}

interface Props {
  scenario: Scenario
  onClick: () => void
  isFavorite?: boolean
  onToggleFavorite?: (e: React.MouseEvent) => void
}

export function ScenarioCard({ scenario, onClick, isFavorite, onToggleFavorite }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-wa-dark2 hover:bg-wa-dark3 border border-wa-border hover:border-wa-green/40 rounded-xl p-4 cursor-pointer flex gap-3 items-start transition-all"
    >
      <span className="text-4xl leading-none flex-shrink-0 mt-0.5">{scenario.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-bold text-sm mb-0.5 text-white">{scenario.title_pt}</div>
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className="flex-shrink-0 p-0.5 -mt-0.5 -mr-0.5 text-wa-sub hover:text-yellow-400 transition-colors"
              title={isFavorite ? 'Remover favorito' : 'Adicionar favorito'}
            >
              {isFavorite
                ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              }
            </button>
          )}
        </div>
        <div className="text-wa-sub text-[11px] mb-1.5 italic">{scenario.title}</div>
        <div className="text-[#8b949e] text-xs leading-relaxed line-clamp-2">{scenario.brief_pt}</div>
        <div className="flex gap-2 mt-2 items-center flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${levelColors[scenario.level]}`}>
            {LEVEL_PT[scenario.level]}
          </span>
          <span className="text-xs text-wa-sub font-semibold">{scenario.cefr}</span>
        </div>
      </div>
    </div>
  )
}

import type { Scenario } from '@/lib/types'
import { LEVEL_PT } from '@/lib/utils'

const levelColors: Record<string, string> = {
  beginner: 'bg-green-950 text-green-400',
  intermediate: 'bg-yellow-950 text-yellow-400',
  challenging: 'bg-red-950 text-red-400',
}

export function ScenarioCard({ scenario, onClick }: { scenario: Scenario; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-wa-dark2 hover:bg-wa-dark3 border border-transparent hover:border-wa-teal rounded-xl p-4 cursor-pointer flex gap-3 items-start transition-all"
    >
      <span className="text-4xl leading-none flex-shrink-0 mt-0.5">{scenario.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm mb-1 text-white">{scenario.title}</div>
        <div className="text-wa-sub text-xs leading-relaxed line-clamp-2">{scenario.brief}</div>
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

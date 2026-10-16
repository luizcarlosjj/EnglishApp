import type { Scenario } from '@/lib/types'

export function BriefBanner({ scenario }: { scenario: Scenario }) {
  return (
    <div className="bg-wa-dark2 border border-wa-border rounded-xl mx-0.5 my-1.5 px-3.5 py-3 text-sm leading-relaxed text-[#c9d1d9]">
      <strong className="block mb-1 text-base text-white">📋 {scenario.title}</strong>
      {scenario.brief}
      <div className="mt-1.5 text-wa-green italic">🎯 Objetivo: {scenario.goal}</div>
    </div>
  )
}

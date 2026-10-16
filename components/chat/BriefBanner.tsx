import type { Scenario } from '@/lib/types'

export function BriefBanner({ scenario }: { scenario: Scenario }) {
  return (
    <div className="bg-wa-header/85 rounded-xl mx-0.5 my-1.5 px-3.5 py-3 text-sm leading-relaxed">
      <strong className="block mb-1 text-base">📋 {scenario.title}</strong>
      {scenario.brief}
      <div className="mt-1.5 text-[#a8e6cf] italic">🎯 Objetivo: {scenario.goal}</div>
    </div>
  )
}

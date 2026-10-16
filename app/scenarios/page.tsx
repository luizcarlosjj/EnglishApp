'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useChatStore } from '@/hooks/useChat'
import { SCENARIOS } from '@/lib/scenarios'
import type { Scenario } from '@/lib/types'
import { ScenarioCard } from '@/components/scenarios/ScenarioCard'
import { BriefModal } from '@/components/scenarios/BriefModal'

const CATEGORIES = [
  { key: 'all', label: 'Todos' },
  { key: 'work', label: '💼 Trabalho' },
  { key: 'travel', label: '✈️ Viagem' },
  { key: 'day', label: '☀️ Dia a Dia' },
  { key: 'social', label: '🌍 Social' },
]

export default function ScenariosPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { startScenario } = useChatStore()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Scenario | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  const filtered = filter === 'all' ? SCENARIOS : SCENARIOS.filter(s => s.category === filter)

  function handleStart(s: Scenario) {
    startScenario(s)
    setSelected(null)
    router.push('/chat')
  }

  return (
    <div className="flex flex-col h-full bg-wa-dark">
      {/* Header */}
      <div className="bg-wa-dark2 px-5 pt-4 pb-0 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white">Escolha um cenário</h1>
          <button onClick={signOut} className="text-wa-sub text-sm hover:text-white transition-colors">Sair</button>
        </div>
        {/* Category tabs */}
        <div className="flex gap-0 overflow-x-auto -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all flex-shrink-0 ${
                filter === cat.key
                  ? 'text-wa-green border-wa-green'
                  : 'text-wa-sub border-transparent hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(s => (
          <ScenarioCard key={s.code} scenario={s} onClick={() => setSelected(s)} />
        ))}
      </div>

      {/* Bottom nav */}
      <nav className="bg-wa-dark2 border-t border-wa-dark3 flex flex-shrink-0">
        <button className="flex-1 flex flex-col items-center gap-1 py-2.5 text-wa-green text-xs font-medium">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
          Cenários
        </button>
        <button onClick={() => router.push('/progress')} className="flex-1 flex flex-col items-center gap-1 py-2.5 text-wa-sub text-xs hover:text-white transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          Progresso
        </button>
      </nav>

      {selected && (
        <BriefModal
          scenario={selected}
          onStart={() => handleStart(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useChatStore } from '@/hooks/useChat'
import { useFavorites } from '@/hooks/useFavorites'
import { SCENARIOS } from '@/lib/scenarios'
import type { Scenario } from '@/lib/types'
import { ScenarioCard } from '@/components/scenarios/ScenarioCard'
import { BriefModal } from '@/components/scenarios/BriefModal'
import { BottomNav } from '@/components/layout/BottomNav'

const CATEGORIES = [
  { key: 'all',      label: 'Todos' },
  { key: 'fav',      label: '⭐ Favoritos' },
  { key: 'work',     label: '💼 Trabalho' },
  { key: 'travel',   label: '✈️ Viagem' },
  { key: 'day',      label: '☀️ Dia a Dia' },
  { key: 'social',   label: '🌍 Social' },
]

export default function ScenariosPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { startScenario } = useChatStore()
  const { favorites, toggle, isFavorite } = useFavorites()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Scenario | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  const filtered = (() => {
    if (filter === 'fav') return SCENARIOS.filter(s => favorites.has(s.code))
    if (filter === 'all') return SCENARIOS
    return SCENARIOS.filter(s => s.category === filter)
  })()

  function handleStart(s: Scenario) {
    startScenario(s)
    setSelected(null)
    router.push('/chat')
  }

  return (
    <div className="flex flex-col h-full bg-wa-dark">
      {/* Header */}
      <div className="bg-wa-dark2 border-b border-wa-border px-5 pt-4 pb-0 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white">Cenários</h1>
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
      <div className="flex-1 overflow-y-auto p-4">
        {filter === 'fav' && filtered.length === 0 ? (
          <div className="text-center py-16 text-wa-sub">
            <div className="text-4xl mb-3">⭐</div>
            <p className="text-sm">Nenhum favorito ainda.<br />Toque na estrela em qualquer cenário para salvar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(s => (
              <ScenarioCard
                key={s.code}
                scenario={s}
                onClick={() => setSelected(s)}
                isFavorite={isFavorite(s.code)}
                onToggleFavorite={(e) => { e.stopPropagation(); toggle(s.code) }}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav active="scenarios" />

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

import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'
import { SCENARIOS } from '@/lib/scenarios'

const KNOWLEDGE_TOPICS = [
  { slug: 'everyday-conversation',   emoji: '💬', title: 'Conversa do Dia a Dia',  sub: 'Small talk, planos, opiniões, gírias' },
  { slug: 'business-english',         emoji: '💼', title: 'Inglês Profissional',     sub: 'E-mails, reuniões, trabalho remoto' },
  { slug: 'travel-english',           emoji: '✈️', title: 'Inglês para Viagem',      sub: 'Hotel, aeroporto, transporte, restaurante' },
  { slug: 'tech-interview-english',   emoji: '🧑‍💻', title: 'Entrevista de Tech',    sub: 'STAR method, vocabulário técnico' },
]

export default function StudyPage() {
  return (
    <div className="flex flex-col h-full bg-wa-dark">
      <div className="bg-wa-dark2 border-b border-wa-border px-5 py-4 flex-shrink-0">
        <h1 className="text-xl font-bold">Estudar</h1>
        <p className="text-xs text-wa-sub mt-0.5">Materiais de apoio para cada situação</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">

        {/* Knowledge topics */}
        <section>
          <h2 className="text-xs font-semibold text-wa-sub uppercase tracking-widest mb-3">Materiais gerais</h2>
          <div className="flex flex-col gap-2">
            {KNOWLEDGE_TOPICS.map(topic => (
              <Link
                key={topic.slug}
                href={`/study/${topic.slug}`}
                className="bg-wa-dark2 border border-wa-border hover:border-wa-green/40 rounded-xl p-3.5 flex items-center gap-3 transition-all group"
              >
                <span className="text-3xl flex-shrink-0">{topic.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white">{topic.title}</div>
                  <div className="text-xs text-wa-sub mt-0.5">{topic.sub}</div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-wa-sub group-hover:text-wa-green transition-colors flex-shrink-0">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Scenario guides */}
        <section>
          <h2 className="text-xs font-semibold text-wa-sub uppercase tracking-widest mb-3">Guias por cenário</h2>
          <div className="flex flex-col gap-2">
            {SCENARIOS.map(s => (
              <Link
                key={s.code}
                href={`/study/${s.code}`}
                className="bg-wa-dark2 border border-wa-border hover:border-wa-green/40 rounded-xl p-3.5 flex items-center gap-3 transition-all group"
              >
                <span className="text-3xl flex-shrink-0">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white">{s.title_pt}</div>
                  <div className="text-xs text-wa-sub mt-0.5 italic">{s.title}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    s.level === 'beginner' ? 'bg-green-950 text-green-400' :
                    s.level === 'intermediate' ? 'bg-yellow-950 text-yellow-400' :
                    'bg-red-950 text-red-400'
                  }`}>
                    {s.cefr}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-wa-sub group-hover:text-wa-green transition-colors">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <BottomNav active="study" />
    </div>
  )
}

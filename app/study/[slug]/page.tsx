import { notFound } from 'next/navigation'
import { readFileSync } from 'fs'
import { join } from 'path'
import Link from 'next/link'
import { MarkdownContent } from '@/components/study/MarkdownContent'
import { SCENARIOS } from '@/lib/scenarios'

const KNOWLEDGE_SLUGS: Record<string, { emoji: string; title: string }> = {
  'everyday-conversation':  { emoji: '💬', title: 'Conversa do Dia a Dia' },
  'business-english':        { emoji: '💼', title: 'Inglês Profissional' },
  'travel-english':          { emoji: '✈️', title: 'Inglês para Viagem' },
  'tech-interview-english':  { emoji: '🧑‍💻', title: 'Entrevista de Tech' },
}

function readFile(slug: string): { content: string; title: string; emoji: string } | null {
  // Scenario guide: WORK_01, TRVL_02, etc.
  const scenarioPattern = /^[A-Z]+_\d+$/
  if (scenarioPattern.test(slug)) {
    const scenario = SCENARIOS.find(s => s.code === slug)
    if (!scenario) return null
    try {
      const content = readFileSync(join(process.cwd(), 'docs', 'scenarios', `${slug}.md`), 'utf-8')
      return { content, title: scenario.title_pt, emoji: scenario.emoji }
    } catch { return null }
  }

  // Knowledge topic
  const meta = KNOWLEDGE_SLUGS[slug]
  if (!meta) return null
  try {
    const content = readFileSync(join(process.cwd(), 'knowledge', `${slug}.md`), 'utf-8')
    return { content, title: meta.title, emoji: meta.emoji }
  } catch { return null }
}

export default async function StudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const file = readFile(slug)
  if (!file) notFound()

  return (
    <div className="flex flex-col h-full bg-wa-dark">
      {/* Header */}
      <div className="bg-wa-dark2 border-b border-wa-border px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
        <Link href="/study" className="text-wa-sub hover:text-white transition-colors p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <span className="text-xl">{file.emoji}</span>
        <h1 className="font-bold text-base text-white flex-1 leading-tight">{file.title}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <MarkdownContent content={file.content} />
      </div>
    </div>
  )
}

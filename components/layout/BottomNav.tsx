'use client'
import { useRouter } from 'next/navigation'

type Tab = 'scenarios' | 'progress' | 'profile'

// Icons always use stroke — color is handled by the parent's text-wa-green / text-wa-sub class
const ICONS: Record<Tab, React.ReactNode> = {
  scenarios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-8"/>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

const LABELS: Record<Tab, string> = {
  scenarios: 'Cenários',
  progress: 'Progresso',
  profile: 'Perfil',
}

const HREFS: Record<Tab, string> = {
  scenarios: '/scenarios',
  progress: '/progress',
  profile: '/profile',
}

export function BottomNav({ active }: { active: Tab }) {
  const router = useRouter()
  const tabs: Tab[] = ['scenarios', 'progress', 'profile']

  return (
    <nav className="bg-wa-dark2 border-t border-wa-border flex flex-shrink-0">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => router.push(HREFS[tab])}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
            tab === active ? 'text-wa-green' : 'text-wa-sub hover:text-white'
          }`}
        >
          {ICONS[tab]}
          {LABELS[tab]}
        </button>
      ))}
    </nav>
  )
}

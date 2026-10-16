'use client'
import { useRouter } from 'next/navigation'

type Tab = 'scenarios' | 'progress' | 'profile'

const tabs: { key: Tab; label: string; href: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    key: 'scenarios',
    label: 'Cenários',
    href: '/scenarios',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.8'} className="w-5 h-5">
        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'progress',
    label: 'Progresso',
    href: '/progress',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.8'} className="w-5 h-5">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 16l4-4 4 4 4-8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Perfil',
    href: '/profile',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.8'} className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export function BottomNav({ active }: { active: Tab }) {
  const router = useRouter()

  return (
    <nav className="bg-wa-dark2 border-t border-wa-border flex flex-shrink-0">
      {tabs.map(tab => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            onClick={() => router.push(tab.href)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              isActive ? 'text-wa-green' : 'text-wa-sub hover:text-white'
            }`}
          >
            {tab.icon(isActive)}
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

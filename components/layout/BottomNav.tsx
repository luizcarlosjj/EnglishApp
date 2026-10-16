'use client'
import { useRouter } from 'next/navigation'

export type NavTab = 'scenarios' | 'study' | 'progress' | 'profile'

const TABS: { key: NavTab; label: string; href: string; icon: React.ReactNode }[] = [
  {
    key: 'scenarios',
    label: 'Cenários',
    href: '/scenarios',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
        <path d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    ),
  },
  {
    key: 'study',
    label: 'Estudar',
    href: '/study',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    key: 'progress',
    label: 'Progresso',
    href: '/progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-8"/>
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Perfil',
    href: '/profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export function BottomNav({ active }: { active: NavTab }) {
  const router = useRouter()

  return (
    <nav className="bg-wa-dark2 border-t border-wa-border flex flex-shrink-0">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => router.push(tab.href)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
            tab.key === active ? 'text-wa-green' : 'text-wa-sub hover:text-white'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'

export const metadata: Metadata = {
  title: 'Simulador de Inglês',
  description: 'Pratique inglês em conversas reais com IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark h-full">
      <body className="h-full bg-wa-dark text-white overflow-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

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
      <body className="h-full bg-[#060810] text-white overflow-hidden flex items-stretch justify-center">
        <div className="w-full max-w-[480px] h-full flex flex-col bg-wa-dark relative shadow-2xl">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  )
}

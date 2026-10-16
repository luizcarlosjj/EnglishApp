'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (loading) return
    router.replace(user ? '/scenarios' : '/login')
  }, [user, loading, router])
  return (
    <div className="flex items-center justify-center h-full bg-wa-dark">
      <div className="w-10 h-10 border-4 border-wa-dark3 border-t-wa-green rounded-full animate-spin" />
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'

const KEY = 'eng_favorites'

function load(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    setFavorites(load())
  }, [])

  const toggle = useCallback((code: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      try { localStorage.setItem(KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }, [])

  const isFavorite = useCallback((code: string) => favorites.has(code), [favorites])

  return { favorites, toggle, isFavorite }
}

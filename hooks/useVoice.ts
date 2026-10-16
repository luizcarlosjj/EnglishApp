'use client'
import { useState, useCallback, useRef } from 'react'

export function useVoice() {
  const [isListening, setIsListening] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const recognitionRef = useRef<unknown>(null)

  const supported = typeof window !== 'undefined' &&
    !!(((window as unknown) as Record<string, unknown>).SpeechRecognition ||
       ((window as unknown) as Record<string, unknown>).webkitSpeechRecognition)

  const startListening = useCallback((onResult: (text: string) => void) => {
    const w = window as unknown as Record<string, new() => {
      lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean
      onresult: (e: { results: { [n: number]: { [n: number]: { transcript: string } } } }) => void
      onend: () => void; onerror: () => void; start: () => void; stop: () => void
    }>
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onresult = (e) => {
      onResult(e.results[0][0].transcript)
    }
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null }
    recognition.onerror = () => { setIsListening(false); recognitionRef.current = null }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [])

  const stopListening = useCallback(() => {
    const r = recognitionRef.current as { stop: () => void } | null
    r?.stop()
    setIsListening(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  }, [])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
  }, [])

  const toggleTTS = useCallback(() => {
    setTtsEnabled(v => {
      if (v && typeof window !== 'undefined') window.speechSynthesis.cancel()
      return !v
    })
  }, [])

  return { isListening, ttsEnabled, startListening, stopListening, speak, stopSpeaking, toggleTTS, supported }
}

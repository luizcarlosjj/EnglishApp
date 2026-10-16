'use client'
import { useState, useCallback, useRef, useEffect } from 'react'

type SpeechRecognitionConstructor = new() => {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean
  onresult: (e: { results: { [n: number]: { [n: number]: { transcript: string } } } }) => void
  onend: () => void; onerror: () => void; start: () => void; stop: () => void
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find(v => v.name === 'Google US English') ||
    voices.find(v => v.name.includes('Google') && v.lang === 'en-US') ||
    voices.find(v => v.lang === 'en-US' && !v.localService) ||
    voices.find(v => v.lang === 'en-US') ||
    voices.find(v => v.lang.startsWith('en')) ||
    null
  )
}

export function useVoice() {
  const [isListening, setIsListening] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const recognitionRef = useRef<unknown>(null)
  const [, forceVoiceLoad] = useState(0)

  useEffect(() => {
    const handler = () => forceVoiceLoad(n => n + 1)
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handler)
  }, [])

  const supported = typeof window !== 'undefined' &&
    !!(((window as unknown) as Record<string, unknown>).SpeechRecognition ||
       ((window as unknown) as Record<string, unknown>).webkitSpeechRecognition)

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.85
    u.pitch = 0.92
    u.volume = 1
    const voice = pickVoice()
    if (voice) u.voice = voice
    window.speechSynthesis.speak(u)
  }, [])

  const speakNow = useCallback((text: string) => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.85
    u.pitch = 0.92
    u.volume = 1
    const voice = pickVoice()
    if (voice) u.voice = voice
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

  const startListening = useCallback((onResult: (text: string) => void) => {
    const w = window as unknown as Record<string, unknown>
    const SR = (w.SpeechRecognition || w.webkitSpeechRecognition) as SpeechRecognitionConstructor | undefined
    if (!SR) return
    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false
    recognition.onresult = (e) => { onResult(e.results[0][0].transcript) }
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

  return { isListening, ttsEnabled, startListening, stopListening, speak, speakNow, stopSpeaking, toggleTTS, supported }
}

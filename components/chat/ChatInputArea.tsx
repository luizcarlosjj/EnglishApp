'use client'
import { useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onHelp: () => void
  disabled: boolean
  isListening?: boolean
  onMicToggle?: () => void
  showMic?: boolean
}

export function ChatInputArea({ value, onChange, onSend, onHelp, disabled, isListening, onMicToggle, showMic }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="bg-wa-dark2 border-t border-wa-border px-2.5 py-2 flex items-center gap-2 flex-shrink-0">
      <button onClick={onHelp} className="w-10 h-10 bg-wa-dark3 border border-wa-border rounded-full flex items-center justify-center text-lg hover:bg-wa-dark transition-colors flex-shrink-0" title="Como digo em inglês…?">
        💡
      </button>
      <div className="flex-1 bg-wa-dark3 rounded-3xl flex items-center px-3.5 py-2 gap-2 border border-wa-border">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem…"
          rows={1}
          disabled={disabled}
          className="flex-1 border-none outline-none text-sm bg-transparent resize-none max-h-24 text-[#E6EDF3] placeholder-wa-sub disabled:opacity-50"
        />
      </div>
      {showMic && (
        <button
          onClick={onMicToggle}
          disabled={disabled && !isListening}
          title={isListening ? 'Parar gravação' : 'Falar em inglês'}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-wa-dark3 border border-wa-border hover:bg-wa-dark'
          } disabled:opacity-40`}
        >
          {isListening ? (
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-wa-sub">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>
      )}
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="w-11 h-11 bg-wa-green rounded-full flex items-center justify-center flex-shrink-0 hover:bg-wa-teal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  )
}

'use client'
import { useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onHelp: () => void
  disabled: boolean
}

export function ChatInputArea({ value, onChange, onSend, onHelp, disabled }: Props) {
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

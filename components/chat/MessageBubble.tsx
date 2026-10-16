'use client'
import { useEffect, useState } from 'react'
import type { Message } from '@/lib/types'

interface Props {
  message: Message
  onSpeak?: (text: string) => void
}

export function MessageBubble({ message, onSpeak }: Props) {
  const [tick, setTick] = useState<'single' | 'double' | 'read'>('single')

  useEffect(() => {
    if (message.role !== 'user') return
    const t1 = setTimeout(() => setTick('double'), 1000)
    const t2 = setTimeout(() => setTick('read'), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [message.role])

  const isSent = message.role === 'user'

  return (
    <div className={`flex my-0.5 ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-2.5 py-1.5 text-sm leading-relaxed break-words ${
          isSent
            ? 'bg-wa-sent text-[#c8eaf4] rounded-lg rounded-tr-none'
            : 'bg-wa-dark3 text-[#E6EDF3] rounded-lg rounded-tl-none'
        }`}
      >
        <span className="whitespace-pre-wrap break-words">{message.content}</span>
        {isSent && (
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className="text-[10px] text-wa-sub">{message.time}</span>
            <span className={`text-xs ${tick === 'read' ? 'text-wa-blue' : 'text-wa-sub'}`}>
              {tick === 'single' ? '✓' : '✓✓'}
            </span>
          </div>
        )}
        {!isSent && (
          <div className="flex items-center justify-between gap-2 mt-0.5">
            {onSpeak ? (
              <button
                onClick={() => onSpeak(message.content)}
                className="text-wa-sub hover:text-wa-green transition-colors"
                title="Ouvir mensagem"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </button>
            ) : <span />}
            <span className="text-[10px] text-wa-sub">{message.time}</span>
          </div>
        )}
      </div>
    </div>
  )
}

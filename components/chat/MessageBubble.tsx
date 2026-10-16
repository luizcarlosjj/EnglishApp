'use client'
import { useEffect, useState } from 'react'
import type { Message } from '@/lib/types'

export function MessageBubble({ message }: { message: Message }) {
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
            ? 'bg-wa-sent text-[#111] rounded-lg rounded-tr-none'
            : 'bg-white text-[#111] rounded-lg rounded-tl-none'
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
        {!isSent && <div className="text-[10px] text-wa-sub text-right mt-0.5">{message.time}</div>}
      </div>
    </div>
  )
}

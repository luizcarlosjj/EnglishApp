'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useChatStore } from '@/hooks/useChat'
import { useVoice } from '@/hooks/useVoice'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { EngagementBar } from '@/components/chat/EngagementBar'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { ChatInputArea } from '@/components/chat/ChatInputArea'
import { HelpModal } from '@/components/chat/HelpModal'
import { EndedBanner } from '@/components/chat/EndedBanner'
import { BriefBanner } from '@/components/chat/BriefBanner'
import { formatChatDate } from '@/lib/utils'

export default function ChatPage() {
  const router = useRouter()
  const { token } = useAuth()
  const {
    scenario, messages, engagement, engagementVisible, isTyping, ended,
    setEngagementVisible, inputValue, setInputValue,
    addUserMessage, processPersonaReply, sendPersonaOpening, endConversation, incrementHelp, startScenario,
  } = useChatStore()

  const { isListening, ttsEnabled, startListening, stopListening, speak, speakNow, stopSpeaking, toggleTTS, supported: voiceSupported } = useVoice()

  const [showHelp, setShowHelp] = useState(false)
  const [sendError, setSendError] = useState('')
  const initialized = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const spokenCountRef = useRef(0)

  useEffect(() => {
    if (!scenario) { router.replace('/scenarios'); return }
    if (initialized.current) return
    initialized.current = true
    if (scenario.who_starts === 'persona') {
      sendPersonaOpening(token!)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (!ttsEnabled) return
    const personaMsgs = messages.filter(m => m.role === 'assistant')
    if (personaMsgs.length > spokenCountRef.current) {
      spokenCountRef.current = personaMsgs.length
      speak(personaMsgs[personaMsgs.length - 1].content)
    }
  }, [messages, ttsEnabled, speak])

  useEffect(() => {
    if (!ttsEnabled) stopSpeaking()
  }, [ttsEnabled, stopSpeaking])

  async function handleSend() {
    const text = inputValue.trim()
    if (!text || ended) return
    setInputValue('')
    setSendError('')
    addUserMessage(text)
    try {
      await processPersonaReply(token!)
    } catch {
      setSendError('⚠️ Erro de conexão. Verifique sua internet e tente novamente.')
    }
  }

  function handleRestart() {
    if (!confirm('Reiniciar conversa? Todo o progresso será perdido.')) return
    startScenario(scenario!)
    spokenCountRef.current = 0
    stopSpeaking()
    if (scenario!.who_starts === 'persona') {
      sendPersonaOpening(token!)
    }
  }

  function handleMicToggle() {
    if (isListening) {
      stopListening()
    } else {
      startListening((text) => {
        const current = useChatStore.getState().inputValue
        setInputValue(current ? current + ' ' + text : text)
      })
    }
  }

  function handleBack() {
    if (messages.length > 0 && !ended) {
      if (!confirm('Sair desta conversa? Seu progresso será perdido.')) return
    }
    router.push('/scenarios')
  }

  if (!scenario) return null

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        scenario={scenario}
        isTyping={isTyping}
        ended={ended}
        onBack={handleBack}
        onToggleEngagement={() => setEngagementVisible(!engagementVisible)}
        onFinish={() => { endConversation(); router.push('/evaluation') }}
        ttsEnabled={ttsEnabled}
        onToggleTTS={voiceSupported ? toggleTTS : undefined}
        onRestart={handleRestart}
      />
      {engagementVisible && <EngagementBar value={engagement} />}
      <div className="flex-1 overflow-y-auto bg-wa-bg px-2.5 py-3 flex flex-col">
        <div className="text-center my-2">
          <span className="bg-wa-dark3/80 text-wa-sub text-xs px-2.5 py-1 rounded-lg">{formatChatDate()}</span>
        </div>
        <BriefBanner scenario={scenario} />
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            onSpeak={voiceSupported && msg.role === 'assistant' ? speakNow : undefined}
          />
        ))}
        {isTyping && <TypingIndicator />}
        {sendError && (
          <div className="text-center my-1">
            <span className="bg-red-900/30 text-red-300 text-xs px-3 py-1 rounded-lg">{sendError}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {ended ? (
        <EndedBanner onEvaluate={() => router.push('/evaluation')} />
      ) : (
        <ChatInputArea
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          onHelp={() => setShowHelp(true)}
          disabled={isTyping}
          showMic={voiceSupported}
          isListening={isListening}
          onMicToggle={handleMicToggle}
        />
      )}
      {showHelp && (
        <HelpModal
          scenario={scenario}
          token={token!}
          onClose={() => setShowHelp(false)}
          onSelect={(text) => { setInputValue(text); setShowHelp(false) }}
          onHelpUsed={incrementHelp}
        />
      )}
    </div>
  )
}

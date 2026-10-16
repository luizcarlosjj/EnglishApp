import { create } from 'zustand'
import type { Scenario, Message, EngagementEntry } from '@/lib/types'
import { typingDelay, sleep, now } from '@/lib/utils'
import { buildPersonaPrompt } from '@/lib/prompts'
import { callAPI } from '@/lib/api'

interface ChatStore {
  scenario: Scenario | null
  messages: Message[]
  engagement: number
  engagementLog: EngagementEntry[]
  helpCount: number
  startTime: number | null
  ended: boolean
  engagementVisible: boolean
  isTyping: boolean
  inputValue: string

  startScenario: (s: Scenario) => void
  addUserMessage: (text: string) => void
  addPersonaMessage: (text: string) => void
  updateEngagement: (flow: 'good' | 'ok' | 'bad') => void
  endConversation: () => void
  setTyping: (v: boolean) => void
  setEngagementVisible: (v: boolean) => void
  setInputValue: (v: string) => void
  incrementHelp: () => void
  processPersonaReply: (token: string) => Promise<void>
  sendPersonaOpening: (token: string) => Promise<void>
  reset: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  scenario: null,
  messages: [],
  engagement: 70,
  engagementLog: [],
  helpCount: 0,
  startTime: null,
  ended: false,
  engagementVisible: false,
  isTyping: false,
  inputValue: '',

  startScenario: (s) => set({
    scenario: s, messages: [], engagement: 70, engagementLog: [],
    helpCount: 0, startTime: Date.now(), ended: false,
    engagementVisible: false, isTyping: false, inputValue: '',
  }),

  addUserMessage: (text) => {
    const msg: Message = { role: 'user', content: text, time: now() }
    set(state => ({ messages: [...state.messages, msg] }))
  },

  addPersonaMessage: (text) => {
    const msg: Message = { role: 'assistant', content: text, time: now() }
    set(state => ({ messages: [...state.messages, msg] }))
  },

  updateEngagement: (flow) => {
    const { engagement } = get()
    let next = engagement
    if (flow === 'good') next = Math.min(100, next + 5)
    else if (flow === 'ok') next = Math.max(0, next - 2)
    else if (flow === 'bad') next = Math.max(0, next - 15)
    const entry: EngagementEntry = { flow, engagement: next, ts: Date.now() }
    set(state => ({ engagement: next, engagementLog: [...state.engagementLog, entry] }))
  },

  endConversation: () => set({ ended: true }),
  setTyping: (v) => set({ isTyping: v }),
  setEngagementVisible: (v) => set({ engagementVisible: v }),
  setInputValue: (v) => set({ inputValue: v }),
  incrementHelp: () => set(state => ({ helpCount: state.helpCount + 1 })),

  processPersonaReply: async (token) => {
    const state = get()
    const s = state.scenario!
    const systemPrompt = buildPersonaPrompt(s, state.engagement)
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...state.messages.map(m => ({ role: m.role, content: m.content }))
    ]

    let rawText: string
    try {
      const data = await callAPI('persona', apiMessages, token)
      rawText = data.content
    } catch {
      throw new Error('connection_error')
    }

    let text = rawText
    let flow: 'good' | 'ok' | 'bad' = 'ok'
    let ended = false

    const flowMatch = text.match(/\[FLOW:(good|ok|bad)\]/i)
    if (flowMatch) {
      flow = flowMatch[1].toLowerCase() as 'good' | 'ok' | 'bad'
      text = text.replace(flowMatch[0], '').trim()
    }
    if (/\[END\]/i.test(text)) {
      ended = true
      text = text.replace(/\[END\]/i, '').trim()
    }

    get().updateEngagement(flow)

    const parts = text.split('|||').map((p: string) => p.trim()).filter(Boolean)
    for (let i = 0; i < parts.length; i++) {
      set({ isTyping: true })
      await sleep(typingDelay(parts[i]))
      set({ isTyping: false })
      get().addPersonaMessage(parts[i])
      if (i < parts.length - 1) await sleep(350)
    }

    if (ended || get().engagement <= 0) get().endConversation()
  },

  sendPersonaOpening: async (_token: string) => {
    const s = get().scenario!
    if (!s.openings.length) return
    const msgs = s.openings[Math.floor(Math.random() * s.openings.length)]
    for (let i = 0; i < msgs.length; i++) {
      set({ isTyping: true })
      await sleep(typingDelay(msgs[i]))
      set({ isTyping: false })
      get().addPersonaMessage(msgs[i])
      if (i < msgs.length - 1) await sleep(350)
    }
  },

  reset: () => set({
    scenario: null, messages: [], engagement: 70, engagementLog: [],
    helpCount: 0, startTime: null, ended: false,
    engagementVisible: false, isTyping: false, inputValue: '',
  }),
}))

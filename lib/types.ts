export interface Persona {
  name: string
  origin: string
  age: number
  role: string
  personality: string
  style: string
}

export interface Scenario {
  code: string
  category: 'work' | 'travel' | 'day' | 'social'
  level: 'beginner' | 'intermediate' | 'challenging'
  cefr: string
  title: string
  title_pt: string
  emoji: string
  brief: string
  brief_pt: string
  goal: string
  persona: Persona
  relationship: string
  who_starts: 'persona' | 'user'
  openings: string[][]
  hidden: string[]
  behavior: string
  nudges: string[]
  vocab: string[]
  success: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

export interface EngagementEntry {
  flow: 'good' | 'ok' | 'bad'
  engagement: number
  ts: number
}

export interface EvaluationScores {
  gramatica: number
  vocabulario: number
  naturalidade: number
  clareza: number
  tom_adequado: number
}

export interface Correction {
  original: string
  corrigido: string
  explicacao: string
  tipo: string
}

export interface NaturalAlternative {
  original: string
  nativo_diria: string
}

export interface Evaluation {
  objetivo_alcancado: boolean
  nivel_estimado: string
  nota_geral: number
  notas: EvaluationScores
  resumo: string
  correcoes: Correction[]
  jeito_mais_natural: NaturalAlternative[]
  vocab_usado: string[]
  vocab_sugerido: string[]
  pontos_fortes: string[]
  melhorias: string[]
  conversa_ideal: string
}

export interface Session {
  id: string
  scenario_code: string
  evaluation: Evaluation | null
  help_count: number
  duration_seconds: number
  created_at: string
}

export type Tier = 'persona' | 'helper' | 'evaluator'

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function typingDelay(text: string): number {
  return Math.min(600 + text.length * 18, 3200)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

export function now(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
}

export function formatChatDate(): string {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function mergeConsecutiveRoles(messages: Array<{ role: string; content: string }>) {
  const result: Array<{ role: string; content: string }> = []
  for (const msg of messages) {
    const last = result[result.length - 1]
    if (last && last.role === msg.role) {
      last.content += '\n' + msg.content
    } else {
      result.push({ role: msg.role, content: msg.content })
    }
  }
  return result
}

export const LEVEL_PT: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  challenging: 'Desafiador',
}

export const SCORE_LABELS: Record<string, string> = {
  gramatica: 'Gramática',
  vocabulario: 'Vocabulário',
  naturalidade: 'Naturalidade',
  clareza: 'Clareza',
  tom_adequado: 'Tom Adequado',
}

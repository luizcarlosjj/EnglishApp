import type { Tier } from './types'

export async function callAPI(
  tier: Tier,
  messages: Array<{ role: string; content: string }>,
  token: string
): Promise<{ content: string }> {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ tier, messages }),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error((err as Record<string, string>).error || String(resp.status))
  }
  return resp.json()
}

export async function saveSession(payload: Record<string, unknown>, token: string): Promise<void> {
  try {
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(payload),
    })
  } catch { /* silent */ }
}

export async function fetchSessions(token: string) {
  const resp = await fetch('/api/sessions', {
    headers: { Authorization: 'Bearer ' + token },
  })
  if (!resp.ok) throw new Error('Failed to load sessions')
  return resp.json()
}

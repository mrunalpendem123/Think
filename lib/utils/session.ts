'use client'

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  const SESSION_KEY = 'private-search-session-id'
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  
  if (!sessionId) {
    sessionId = `session-${crypto.randomUUID()}`
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  
  return sessionId
}

export function clearSessionId(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('private-search-session-id')
}


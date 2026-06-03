import { getGoogleIdToken } from '@/lib/auth/google-auth'

export interface BibleAIResult {
  success: boolean
  response: string
  topic_tags: string[]
  related_verses: string[]
  model?: string
  fallback?: boolean
  profile?: string
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || ''

interface AskBibleAIOptions {
  task?: 'chat' | 'explain' | 'compare'
  depth?: 'brief' | 'deep'
}

export async function askBibleAI(prompt: string, options: AskBibleAIOptions = {}): Promise<BibleAIResult> {
  if (!backendUrl) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL no está configurado.')
  }

  const token = getGoogleIdToken()
  if (!token) {
    throw new Error('Inicia sesión con Google para usar las funciones de IA.')
  }

  const response = await fetch(`${backendUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      task: options.task || 'chat',
      depth: options.depth || 'brief',
      messages: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.details || data?.error || 'Error consultando la IA.')
  }

  return data
}

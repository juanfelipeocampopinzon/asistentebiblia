export interface BibleAIResult {
  success: boolean
  response: string
  topic_tags: string[]
  related_verses: string[]
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || ''

export async function askBibleAI(prompt: string): Promise<BibleAIResult> {
  if (!backendUrl) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL no está configurado.')
  }

  const response = await fetch(`${backendUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
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

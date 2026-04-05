import type { AiChatPayload, AiChatResponse } from '../model/ai-assistant.types'

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:3001'

export async function sendAiMessage(payload: AiChatPayload): Promise<AiChatResponse> {
  const response = await fetch(`${AI_API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error('Не удалось получить ответ AI')
  }

  return response.json()
}

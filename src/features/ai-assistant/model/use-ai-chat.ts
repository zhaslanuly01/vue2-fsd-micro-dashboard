import { sendAiMessage } from '../api/chat.api'
import type { AiChatPayload, AiMessage } from './ai-assistant.types'

function createMessage(role: 'user' | 'assistant', text: string): AiMessage {
  return {
    id: `${role}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    role,
    text,
    createdAt: new Date().toISOString()
  }
}

export function createAiChat() {
  return {
    messages: [
      createMessage(
        'assistant',
        'Привет! Я AI Assistant. Могу сделать сводку по странице, выделить риски и помочь найти аномалии.'
      )
    ] as AiMessage[],
    loading: false,

    async ask(payload: AiChatPayload) {
      this.messages.push(createMessage('user', payload.question))
      this.loading = true

      try {
        const response = await sendAiMessage(payload)
        this.messages.push(createMessage('assistant', response.message))
      } catch (error) {
        console.error(error)
        this.messages.push(
          createMessage('assistant', 'Не удалось получить ответ. Попробуй еще раз.')
        )
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.messages = [
        createMessage(
          'assistant',
          'Чат очищен. Могу снова помочь со сводкой, рисками или аномалиями.'
        )
      ]
    }
  }
}

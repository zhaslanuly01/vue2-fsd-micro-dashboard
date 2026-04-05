export type AiRole = 'user' | 'assistant'

export interface AiMessage {
  id: string
  role: AiRole
  text: string
  createdAt: string
}

export interface AiChatPayload {
  page: string
  question: string
  filters?: Record<string, unknown>
  context?: Record<string, unknown>
}

export interface AiChatResponse {
  message: string
}

export interface AiAssistantState {
  messages: AiMessage[]
  loading: boolean
}

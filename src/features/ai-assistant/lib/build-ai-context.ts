import type { AiChatPayload } from '../model/ai-assistant.types'

interface BuildAiContextParams {
  page: string
  filters?: Record<string, unknown>
  selectedItem?: Record<string, unknown> | null
  stats?: Record<string, unknown>
}

export function buildAiContext(params: BuildAiContextParams): Omit<AiChatPayload, 'question'> {
  const { page, filters = {}, selectedItem = null, stats = {} } = params

  return {
    page,
    filters,
    context: {
      selectedItem,
      stats
    }
  }
}

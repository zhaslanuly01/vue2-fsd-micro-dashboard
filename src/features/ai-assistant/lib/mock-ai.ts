import type { AiChatPayload, AiChatResponse } from '../model/ai-assistant.types'

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function hasSome(text: string, words: string[]) {
  return words.some((word) => text.includes(word))
}

function formatFilters(filters?: Record<string, unknown>) {
  if (!filters || Object.keys(filters).length === 0) {
    return 'Фильтры не выбраны.'
  }

  const activeFilters = Object.entries(filters)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `• ${key}: ${String(value)}`)

  return activeFilters.length > 0 ? activeFilters.join('\n') : 'Фильтры не выбраны.'
}

function buildEquipmentReply(payload: AiChatPayload): string {
  const question = normalize(payload.question)
  const filtersText = formatFilters(payload.filters)

  if (hasSome(question, ['риск', 'риски', 'опасн'])) {
    return [
      'Я вижу потенциальные риски по оборудованию:',
      '• проверь объекты со статусами warning / critical;',
      '• обрати внимание на оборудование с просроченным сервисом;',
      '• отдельно стоит проверить единицы с высокой нагрузкой и низкой эффективностью.',
      '',
      'Текущие фильтры:',
      filtersText
    ].join('\n')
  }

  if (hasSome(question, ['сводка', 'итог', 'summary'])) {
    return [
      'Краткая сводка по разделу "Оборудование":',
      '• в первую очередь смотри на состояние, эффективность и дату последнего обслуживания;',
      '• если есть связанный график, ищи выбросы и резкие отклонения;',
      '• для приоритизации сначала открой проблемные строки таблицы.',
      '',
      'Текущие фильтры:',
      filtersText
    ].join('\n')
  }

  return [
    'По разделу "Оборудование" я бы рекомендовал:',
    '• отсортировать таблицу по критичности;',
    '• открыть карточки с низкой эффективностью;',
    '• проверить, не совпадают ли инциденты с сервисными задержками.'
  ].join('\n')
}

function buildMaintenanceReply(payload: AiChatPayload): string {
  const question = normalize(payload.question)

  if (hasSome(question, ['приоритет', 'срочно', 'важно'])) {
    return [
      'Я бы приоритизировал заявки так:',
      '• сначала аварийные и влияющие на безопасность;',
      '• затем заявки, которые блокируют добычу или логистику;',
      '• потом повторяющиеся инциденты по одному и тому же объекту.'
    ].join('\n')
  }

  return [
    'По заявкам на обслуживание рекомендую смотреть:',
    '• просроченные заявки;',
    '• повторные обращения;',
    '• заявки по объектам с высоким уровнем нагрузки.'
  ].join('\n')
}

function buildEcoReply(payload: AiChatPayload): string {
  const question = normalize(payload.question)

  if (hasSome(question, ['аномал', 'отклон', 'эколог'])) {
    return [
      'В экологических данных стоит искать:',
      '• значения выше допустимых порогов;',
      '• резкие скачки по сравнению с предыдущими периодами;',
      '• кластеры инцидентов в одном регионе.'
    ].join('\n')
  }

  return [
    'По eco station я бы дал такой фокус:',
    '• сравни показатели по регионам;',
    '• найди станции с повторяющимися отклонениями;',
    '• проверь связь с соседними объектами и инцидентами.'
  ].join('\n')
}

function buildTankReply(): string {
  return [
    'По резервуарам полезно проверить:',
    '• топ по заполненности;',
    '• объекты, близкие к критическому уровню;',
    '• сочетание высокой заполненности и активных инцидентов.'
  ].join('\n')
}

function buildPipelineReply(): string {
  return [
    'По трубопроводам я бы рекомендовал:',
    '• искать участки с частыми авариями;',
    '• сравнить инциденты с возрастом участка;',
    '• проверить зоны с повышенной нагрузкой и риском утечки.'
  ].join('\n')
}

function buildGenericReply(payload: AiChatPayload): string {
  return [
    `Я анализирую раздел "${payload.page}".`,
    'Могу помочь со сводкой, рисками, аномалиями и приоритизацией.',
    'Попробуй спросить: "Какие объекты требуют внимания?"'
  ].join('\n')
}

export async function getMockAiReply(payload: AiChatPayload): Promise<AiChatResponse> {
  const page = normalize(payload.page)

  await new Promise((resolve) => setTimeout(resolve, 700))

  if (page.includes('equipment')) {
    return { message: buildEquipmentReply(payload) }
  }

  if (page.includes('maintenance')) {
    return { message: buildMaintenanceReply(payload) }
  }

  if (page.includes('eco')) {
    return { message: buildEcoReply(payload) }
  }

  if (page.includes('tank') || page.includes('storage')) {
    return { message: buildTankReply() }
  }

  if (page.includes('pipeline')) {
    return { message: buildPipelineReply() }
  }

  return { message: buildGenericReply(payload) }
}

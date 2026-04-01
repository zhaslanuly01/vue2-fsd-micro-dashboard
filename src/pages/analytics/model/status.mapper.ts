export const WELL_STATUS_LABELS = {
  active: 'Активные',
  inactive: 'Неактивные',
  maintenance: 'На обслуживании',
  conservation: 'Консервация'
} as const

export const EQUIPMENT_STATUS_LABELS = {
  operational: 'Работает',
  warning: 'Предупреждение',
  critical: 'Критическое',
  offline: 'Отключено'
} as const

export const REQUEST_STATUS_LABELS = {
  new: 'Новые',
  in_progress: 'В работе',
  completed: 'Завершенные',
  overdue: 'Просроченные'
} as const

export const TANK_STATUS_LABELS = {
  normal: 'Нормальный',
  high_load: 'Высокая нагрузка',
  maintenance: 'На обслуживании',
  offline: 'Отключен'
} as const

export const ECO_STATUS_LABELS = {
  normal: 'Нормальный',
  attention: 'Внимание',
  critical: 'Критический'
} as const

export const PIPELINE_STATUS_LABELS = {
  operational: 'Работает',
  inspection: 'Проверка',
  repair: 'Ремонт'
} as const

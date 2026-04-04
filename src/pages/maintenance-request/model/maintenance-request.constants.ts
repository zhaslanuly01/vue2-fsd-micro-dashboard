import { RequestStatus, RequestPriority } from '@/entities/maintenance-request'

export const REQUEST_STATUS_META: Record<RequestStatus, { label: string; tagType: string }> = {
  new: { label: 'Новая', tagType: 'info' },
  in_progress: { label: 'В работе', tagType: 'warning' },
  completed: { label: 'Завершена', tagType: 'success' },
  overdue: { label: 'Просрочена', tagType: 'danger' }
}

export const REQUEST_PRIORITY_META: Record<RequestPriority, { label: string; tagType: string }> = {
  low: { label: 'Низкий', tagType: 'success' },
  medium: { label: 'Средний', tagType: 'warning' },
  high: { label: 'Высокий', tagType: 'danger' }
}

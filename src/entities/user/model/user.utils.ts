import type { User } from './user.types'

export function getUserFullName(user: User | null | undefined): string {
  if (!user) return ''

  return [user.surname, user.name, user.middle_name].filter(Boolean).join(' ')
}

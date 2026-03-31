import type { SidebarMenuItem } from '../model/sidebar_item.types'

import homeIcon from '@/shared/assets/icons/home.svg'
import analyticsIcon from '@/shared/assets/icons/analytics.svg'
import usersIcon from '@/shared/assets/icons/users.svg'
import settingsIcon from '@/shared/assets/icons/settings.svg'

export const sidebarConfig: SidebarMenuItem[] = [
  {
    key: 'home',
    label: 'Главная',
    path: '/',
    svgIcon: homeIcon
  },
  {
    key: 'analytics',
    label: 'Аналитика',
    path: '/analytics',
    svgIcon: analyticsIcon
  },
  {
    key: 'users',
    label: 'Пользователи',
    path: '/users',
    svgIcon: usersIcon
  },
  {
    key: 'settings',
    label: 'Настройки',
    path: '/settings',
    svgIcon: settingsIcon
  }
]

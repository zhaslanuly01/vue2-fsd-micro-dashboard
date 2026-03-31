import type { SidebarMenuItem } from '../model/sidebar_item.types'

import analyticsIcon from '@/shared/assets/icons/analytics.svg'
import ecoStationIcon from '@/shared/assets/icons/eco-station.svg'
import equipmentIcon from '@/shared/assets/icons/equipment.svg'
import homeIcon from '@/shared/assets/icons/home.svg'
import maintenanceRequestIcon from '@/shared/assets/icons/maintenance-requests.svg'
import oilFieldIcon from '@/shared/assets/icons/oil-field.svg'
import pipelineSectionIcon from '@/shared/assets/icons/pipeline-section.svg'
import settingsIcon from '@/shared/assets/icons/settings.svg'
import storageTankIcon from '@/shared/assets/icons/storage-tank.svg'
import wellIcon from '@/shared/assets/icons/well.svg'

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
    key: 'well',
    label: 'Скважины',
    path: '/well',
    svgIcon: wellIcon
  },
  {
    key: 'oil-field',
    label: 'Добыча по месторождениям',
    path: '/oil-field',
    svgIcon: oilFieldIcon
  },
  {
    key: 'equipment',
    label: 'Оборудование',
    path: '/equipment',
    svgIcon: equipmentIcon
  },
  {
    key: 'maintenance-requests',
    label: 'Заявки на обслуживание',
    path: '/maintenance-requests',
    svgIcon: maintenanceRequestIcon
  },
  {
    key: 'storage-tank',
    label: 'Резервуары',
    path: '/storage-tank',
    svgIcon: storageTankIcon
  },
  {
    key: 'eco-station',
    label: 'Экологический мониторинг',
    path: '/eco-station',
    svgIcon: ecoStationIcon
  },
  {
    key: 'pipeline-section',
    label: 'Транспортировка',
    path: '/pipeline-section',
    svgIcon: pipelineSectionIcon
  },
  {
    key: 'settings',
    label: 'Настройки',
    path: '/settings',
    svgIcon: settingsIcon
  }
]

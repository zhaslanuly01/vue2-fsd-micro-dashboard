# Micro Dashboard

Демо-проект, реализующий микро-дашборд для мониторинга нефтегазовой инфраструктуры.

Проект включает:

- Скважины (Wells)
- Месторождения (Oil Fields)
- Оборудование (Equipment)
- Заявки (Maintenance Requests)
- Резервуары (Storage Tanks)
- Экологические станции (Eco Stations)
- Трубопроводы (Pipelines)

## Стек технологий

- Vue 2.7
- TypeScript
- Vuex
- Vite
- Element UI
- Chart.js
- Leaflet (карты)
- Vitest (unit / component tests)
- Cypress (e2e tests)

## Установка

```
npm install
```

## Запуск проекта

```
npm run dev
```

Приложение будет доступно по адресу:

```
http://localhost:5173
```

## Сборка проекта

```
npm run build
```

Preview сборки:

```
npm run preview
```

## Доступ (Mock Auth)

```
Email: admin@email.com
Password: adminadmin
```

## Тестирование

Unit + Component тесты (Vitest)

Запустить:

```
npx vitest run src/entities/equipment/model/__tests__/equipment.getters.spec.ts
```

### E2E тесты (Cypress)

```
npx cypress open
```

## Архитектура (FSD)

Проект построен по Feature-Sliced Design (FSD):

```
src/
  app/          # инициализация приложения
  pages/        # страницы (composition level)
  widgets/      # крупные UI блоки (карты, графики, KPI)
  entities/     # бизнес-сущности (equipment, wells и тд)
  shared/       # утилиты, стили, общие компоненты
```

## Основные принципы

- Entities → данные + store + модели
- Widgets → UI-композиция (карта, графики, KPI)
- Pages → связывают store и widgets
- Shared → переиспользуемый код

## Работа со state (Vuex)

Каждая сущность имеет свой модуль:

```
equipment/
well/
oilField/
pipeline/
storageTank/
ecoStation/
maintenanceRequest/
```

Каждый модуль содержит:

- state
- getters
- actions
- mutations

### Пример логики

- загрузка данных (fetch...)
- фильтрация (filteredItems)
- пагинация (paginatedItems)
- KPI (kpi)
- графики (statusChartData)
- drill-down фильтры

## Карты

### Используется:

- Leaflet
- кластеризация (markerCluster)

### Функциональность:

- hover → highlight
- click → select
- синхронизация с таблицей

## Графики

## Используется:

Chart.js

Типы:

- Pie / Doughnut
- Horizontal Bar

Поддержка:

- drill-down фильтров
- интерактивных кликов

## Mock данные

Проект полностью работает на mock данных:

- нет реального backend
- данные генерируются локально
- можно легко заменить на API

<template>
  <div class="request-page">
    <div class="request-page__header">
      <div class="request-page__header-text">
        <h1 class="request-page__title">Заявки на обслуживание</h1>
        <p class="request-page__subtitle">
          Контроль статусов, сроков, стоимости и распределения по командам
        </p>
      </div>

      <el-button class="request-page__reset-button" @click="handleResetFilters">
        Сбросить фильтры
      </el-button>
    </div>

    <MaintenanceRequestKpi :loading="loading" />

    <div class="request-page__analytics-grid">
      <div class="request-page__analytics-main">
        <MaintenanceRequestMap :loading="loading" />
      </div>

      <div class="request-page__analytics-side">
        <MaintenanceRequestStatusChart :loading="loading" />
        <MaintenanceRequestCostChart :loading="loading" />
      </div>
    </div>

    <el-card shadow="never" class="request-page__filters">
      <div class="request-page__filters-grid">
        <el-input
          :value="filters.search"
          placeholder="Поиск по заявке, объекту, месторождению..."
          clearable
          @input="handleSearchInput"
        />

        <el-select
          :value="filters.status"
          placeholder="Статус"
          clearable
          @change="handleStatusChange"
        >
          <el-option
            v-for="status in statuses"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>

        <el-select
          :value="filters.fieldName"
          placeholder="Месторождение"
          clearable
          @change="handleFieldChange"
        >
          <el-option v-for="field in fieldNames" :key="field" :label="field" :value="field" />
        </el-select>

        <el-select
          :value="filters.priority"
          placeholder="Приоритет"
          clearable
          @change="handlePriorityChange"
        >
          <el-option
            v-for="priority in priorities"
            :key="priority.value"
            :label="priority.label"
            :value="priority.value"
          />
        </el-select>

        <el-select
          :value="filters.responsibleTeam"
          placeholder="Команда"
          clearable
          @change="handleResponsibleTeamChange"
        >
          <el-option v-for="team in responsibleTeams" :key="team" :label="team" :value="team" />
        </el-select>
      </div>
    </el-card>

    <el-card shadow="never" class="request-page__table-card">
      <div class="request-page__table-meta">
        <span>Найдено записей: {{ total }}</span>
      </div>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        class="request-page__alert"
      />

      <el-table
        v-loading="loading"
        :data="paginatedItems"
        border
        stripe
        class="request-page__table"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="title" label="Заявка" min-width="200" />
        <el-table-column prop="objectName" label="Объект" min-width="150" />
        <el-table-column prop="fieldName" label="Месторождение" min-width="160" />

        <el-table-column prop="priority" label="Приоритет" min-width="130">
          <template #default="{ row }">
            <el-tag :type="getPriorityTagType(row.priority)" effect="plain">
              {{ formatPriority(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Статус" min-width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="plain">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="Создана" min-width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="plannedDate" label="Плановая дата" min-width="140">
          <template #default="{ row }">
            {{ formatDate(row.plannedDate) }}
          </template>
        </el-table-column>

        <el-table-column prop="completedAt" label="Завершена" min-width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.completedAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="cost" label="Стоимость" min-width="140" sortable="custom">
          <template #default="{ row }">
            {{ formatMoney(row.cost) }}
          </template>
        </el-table-column>

        <el-table-column prop="responsibleTeam" label="Команда" min-width="150" />

        <template #empty>
          <div class="request-page__empty">
            <span v-if="loading">Загрузка данных...</span>
            <span v-else>По текущим фильтрам ничего не найдено</span>
          </div>
        </template>
      </el-table>

      <div class="request-page__pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :current-page="filters.page"
          :page-size="filters.pageSize"
          :page-sizes="[5, 10, 15, 20]"
          :total="total"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-drawer
      :visible.sync="isDrawerVisible"
      :with-header="false"
      :size="drawerSize"
      direction="rtl"
      :before-close="handleCloseDrawer"
      custom-class="request-page__drawer"
    >
      <div v-if="selectedRequest" class="request-drawer">
        <div class="request-drawer__header">
          <div class="request-drawer__header-text">
            <div class="request-drawer__eyebrow">Заявка на обслуживание</div>
            <div class="request-drawer__title">{{ selectedRequest.title }}</div>
            <div class="request-drawer__subtitle">
              {{ selectedRequest.objectName }} · {{ selectedRequest.fieldName }}
            </div>
          </div>

          <button
            type="button"
            class="request-drawer__close"
            aria-label="Закрыть"
            @click="handleCloseDrawer"
          >
            ×
          </button>
        </div>

        <div class="request-drawer__content">
          <div class="request-drawer__hero">
            <el-tag :type="getStatusTagType(selectedRequest.status)" effect="dark">
              {{ formatStatus(selectedRequest.status) }}
            </el-tag>
          </div>

          <div class="request-drawer__metrics">
            <el-card shadow="never" class="request-drawer__metric-card">
              <div class="request-drawer__metric-label">Стоимость</div>
              <div class="request-drawer__metric-value">
                {{ formatMoney(selectedRequest.cost) }}
              </div>
            </el-card>

            <el-card shadow="never" class="request-drawer__metric-card">
              <div class="request-drawer__metric-label">Приоритет</div>
              <div class="request-drawer__metric-value">
                {{ formatPriority(selectedRequest.priority) }}
              </div>
            </el-card>

            <el-card shadow="never" class="request-drawer__metric-card">
              <div class="request-drawer__metric-label">Команда</div>
              <div class="request-drawer__metric-value">{{ selectedRequest.responsibleTeam }}</div>
            </el-card>

            <el-card shadow="never" class="request-drawer__metric-card">
              <div class="request-drawer__metric-label">Плановая дата</div>
              <div class="request-drawer__metric-value">
                {{ formatDate(selectedRequest.plannedDate) }}
              </div>
            </el-card>
          </div>

          <el-card shadow="never" class="request-drawer__timeline-card">
            <div class="request-drawer__section-title">Жизненный цикл</div>

            <div class="request-drawer__timeline-list">
              <div class="request-drawer__timeline-item">
                <span>Создана</span>
                <b>{{ formatDateTime(selectedRequest.createdAt) }}</b>
              </div>
              <div class="request-drawer__timeline-item">
                <span>План выполнения</span>
                <b>{{ formatDate(selectedRequest.plannedDate) }}</b>
              </div>
              <div class="request-drawer__timeline-item">
                <span>Фактическое завершение</span>
                <b>{{
                  selectedRequest.completedAt
                    ? formatDateTime(selectedRequest.completedAt)
                    : 'Не завершена'
                }}</b>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="request-drawer__details-card">
            <div class="request-drawer__section-title">Паспорт заявки</div>

            <div class="request-drawer__details-list">
              <div class="request-drawer__details-item">
                <span>ID</span>
                <b>{{ selectedRequest.id }}</b>
              </div>
              <div class="request-drawer__details-item">
                <span>Название</span>
                <b>{{ selectedRequest.title }}</b>
              </div>
              <div class="request-drawer__details-item">
                <span>Объект</span>
                <b>{{ selectedRequest.objectName }}</b>
              </div>
              <div class="request-drawer__details-item">
                <span>Месторождение</span>
                <b>{{ selectedRequest.fieldName }}</b>
              </div>
              <div class="request-drawer__details-item">
                <span>Команда</span>
                <b>{{ selectedRequest.responsibleTeam }}</b>
              </div>
              <div class="request-drawer__details-item">
                <span>Координаты</span>
                <b>{{ selectedRequest.lat }}, {{ selectedRequest.lng }}</b>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type {
  MaintenanceRequest,
  MaintenanceRequestFilters,
  RequestPriority,
  RequestStatus
} from '@/entities/maintenance-request/model/maintenance-request.types'
import { MaintenanceRequestKpi } from '@/widgets/maintenance-request/maintenance-request-kpi'
import { MaintenanceRequestMap } from '@/widgets/maintenance-request/maintenance-request-map'
import { MaintenanceRequestStatusChart } from '@/widgets/maintenance-request/maintenance-request-status-chart'
import { MaintenanceRequestCostChart } from '@/widgets/maintenance-request/maintenance-request-cost-chart'
import { REQUEST_STATUS_META } from '../model/maintenance-request.constants'

export default Vue.extend({
  name: 'MaintenanceRequestPage',

  components: {
    MaintenanceRequestKpi,
    MaintenanceRequestMap,
    MaintenanceRequestStatusChart,
    MaintenanceRequestCostChart
  },

  data() {
    return {
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1440
    }
  },

  computed: {
    loading(): boolean {
      return this.$store.state.maintenanceRequest.loading
    },

    error(): string | null {
      return this.$store.state.maintenanceRequest.error
    },

    filters(): MaintenanceRequestFilters {
      return this.$store.state.maintenanceRequest.filters
    },

    selectedRequest(): MaintenanceRequest | null {
      return this.$store.state.maintenanceRequest.selectedRequest
    },

    paginatedItems(): MaintenanceRequest[] {
      return this.$store.getters['maintenanceRequest/paginatedItems']
    },

    total(): number {
      return this.$store.getters['maintenanceRequest/total']
    },

    statuses(): Array<{ label: string; value: string }> {
      return this.$store.getters['maintenanceRequest/statuses']
    },

    priorities(): Array<{ label: string; value: string }> {
      return this.$store.getters['maintenanceRequest/priorities']
    },

    fieldNames(): string[] {
      return this.$store.getters['maintenanceRequest/fieldNames']
    },

    responsibleTeams(): string[] {
      return this.$store.getters['maintenanceRequest/responsibleTeams']
    },

    highlightedRequestId(): number | null {
      return this.$store.state.maintenanceRequest.highlightedRequestId
    },

    drawerSize(): string {
      if (this.windowWidth <= 575) return '100%'
      if (this.windowWidth <= 991) return '72%'
      return '460px'
    },

    isDrawerVisible: {
      get(): boolean {
        return Boolean(this.selectedRequest)
      },
      set(value: boolean) {
        if (!value) {
          this.$store.dispatch('maintenanceRequest/closeDetails')
        }
      }
    }
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
    },

    handleSearchInput(value: string) {
      this.$store.dispatch('maintenanceRequest/updateFilters', { search: value })
    },

    handleStatusChange(value: string) {
      this.$store.dispatch('maintenanceRequest/updateFilters', { status: value || '' })
    },

    handleFieldChange(value: string) {
      this.$store.dispatch('maintenanceRequest/updateFilters', { fieldName: value || '' })
    },

    handlePriorityChange(value: string) {
      this.$store.dispatch('maintenanceRequest/updateFilters', { priority: value || '' })
    },

    handleResponsibleTeamChange(value: string) {
      this.$store.dispatch('maintenanceRequest/updateFilters', { responsibleTeam: value || '' })
    },

    handlePageChange(page: number) {
      this.$store.dispatch('maintenanceRequest/changePage', page)
    },

    handlePageSizeChange(pageSize: number) {
      this.$store.dispatch('maintenanceRequest/changePageSize', pageSize)
    },

    handleResetFilters() {
      this.$store.dispatch('maintenanceRequest/resetFilters')
    },

    handleRowClick(row: MaintenanceRequest) {
      this.$store.dispatch('maintenanceRequest/selectRequest', row)
    },

    handleCloseDrawer() {
      this.$store.dispatch('maintenanceRequest/closeDetails')
    },

    handleSortChange({
      prop,
      order
    }: {
      column: unknown
      prop: string
      order: '' | 'ascending' | 'descending'
    }) {
      this.$store.dispatch('maintenanceRequest/changeSorting', {
        sortBy: prop || '',
        sortOrder: order || ''
      })
    },

    getRowClassName({ row }: { row: MaintenanceRequest }) {
      return this.highlightedRequestId === row.id ? 'request-table__row--highlighted' : ''
    },

    formatStatus(status: RequestStatus) {
      return REQUEST_STATUS_META[status].label
    },

    formatPriority(priority: RequestPriority) {
      const map: Record<RequestPriority, string> = {
        low: 'Низкий',
        medium: 'Средний',
        high: 'Высокий'
      }

      return map[priority]
    },

    getStatusTagType(status: RequestStatus) {
      return REQUEST_STATUS_META[status].tagType
    },

    getPriorityTagType(priority: RequestPriority) {
      const map: Record<RequestPriority, string> = {
        low: 'success',
        medium: 'warning',
        high: 'danger'
      }

      return map[priority]
    },

    formatMoney(value: number): string {
      return new Intl.NumberFormat('ru-RU').format(value)
    },

    formatDate(value: string | null): string {
      if (!value) return '—'

      const date = new Date(value)

      if (Number.isNaN(date.getTime())) {
        return value
      }

      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date)
    },

    formatDateTime(value: string | null): string {
      if (!value) return '—'

      const date = new Date(value)

      if (Number.isNaN(date.getTime())) {
        return value
      }

      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }
  },

  mounted() {
    this.$store.dispatch('maintenanceRequest/fetchMaintenanceRequests')
    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  }
})
</script>

<style scoped>
.request-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.request-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.request-page__header-text {
  min-width: 0;
}

.request-page__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--label-primary);
  word-break: break-word;
}

.request-page__subtitle {
  margin: 8px 0 0;
  color: var(--label-secondary);
  word-break: break-word;
}

.request-page__reset-button {
  flex-shrink: 0;
}

.request-page__analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(340px, 0.9fr);
  gap: 16px;
  align-items: stretch;
}

.request-page__analytics-main,
.request-page__analytics-side {
  min-width: 0;
}

.request-page__analytics-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-page__filters,
.request-page__table-card {
  border-radius: 18px;
}

.request-page__filters-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(160px, 1fr));
  gap: 12px;
}

.request-page__table-meta {
  margin-bottom: 16px;
  color: var(--label-secondary);
  word-break: break-word;
}

.request-page__alert {
  margin-bottom: 16px;
}

.request-page__table {
  width: 100%;
}

.request-page__table :deep(.request-table__row--highlighted > td) {
  background-color: #ecf5ff !important;
}

.request-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.request-page__pagination :deep(.el-pagination) {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.request-page__empty {
  padding: 24px 0;
  color: var(--label-secondary);
}

.request-drawer {
  min-height: 100%;
  background: #f7f8fa;
}

.request-drawer__header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  padding: 20px;
  border-bottom: 1px solid var(--neutral-gray-4);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.request-drawer__header-text {
  min-width: 0;
}

.request-drawer__close {
  width: 40px;
  height: 40px;
  border: 1px solid var(--neutral-gray-4);
  border-radius: 10px;
  background: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}

.request-drawer__content {
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-drawer__hero {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
}

.request-drawer__eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--label-secondary);
  margin-bottom: 6px;
}

.request-drawer__title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--label-primary);
  word-break: break-word;
}

.request-drawer__subtitle {
  margin-top: 6px;
  color: var(--label-secondary);
  word-break: break-word;
}

.request-drawer__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-width: 0;
}

.request-drawer__metric-card,
.request-drawer__timeline-card,
.request-drawer__details-card {
  border-radius: 16px;
  min-width: 0;
}

.request-drawer__metric-label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.request-drawer__metric-value {
  font-size: 20px;
  font-weight: 700;
  word-break: break-word;
}

.request-drawer__section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.35;
  word-break: break-word;
}

.request-drawer__timeline-list,
.request-drawer__details-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.request-drawer__timeline-item,
.request-drawer__details-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.request-drawer__timeline-item:last-child,
.request-drawer__details-item:last-child {
  border-bottom: none;
}

.request-drawer__timeline-item span,
.request-drawer__timeline-item b,
.request-drawer__details-item span,
.request-drawer__details-item b {
  word-break: break-word;
}

:deep(.request-page__drawer) {
  max-width: 100%;
}

:deep(.request-page__drawer .el-drawer) {
  height: 100dvh !important;
  max-height: 100dvh !important;
  overflow: hidden;
}

:deep(.request-page__drawer .el-drawer__body) {
  height: 100%;
  overflow-y: auto !important;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 1280px) {
  .request-page__analytics-grid {
    grid-template-columns: 1fr;
  }

  .request-page__filters-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 991px) {
  .request-page__title {
    font-size: 24px;
  }

  .request-page__pagination {
    justify-content: flex-start;
  }

  .request-page__pagination :deep(.el-pagination) {
    justify-content: flex-start;
  }

  .request-drawer__header {
    padding: 16px;
  }

  .request-drawer__content {
    padding: 12px 16px 20px;
  }
}

@media (max-width: 768px) {
  .request-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .request-page__reset-button {
    width: 100%;
  }

  .request-page__filters-grid {
    grid-template-columns: 1fr;
  }

  .request-drawer__metrics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575px) {
  .request-page__title {
    font-size: 22px;
  }

  .request-page__subtitle {
    font-size: 14px;
  }

  .request-page__filters,
  .request-page__table-card {
    border-radius: 14px;
  }

  .request-page__table-meta {
    margin-bottom: 12px;
    font-size: 14px;
  }

  .request-drawer__header {
    padding: 12px;
  }

  .request-drawer__content {
    padding: 12px 12px 20px;
    gap: 12px;
  }

  .request-drawer__title {
    font-size: 22px;
  }

  .request-drawer__subtitle {
    font-size: 13px;
  }

  .request-drawer__close {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    font-size: 22px;
  }

  .request-drawer__metric-card,
  .request-drawer__timeline-card,
  .request-drawer__details-card {
    border-radius: 12px;
  }

  .request-drawer__metric-value {
    font-size: 18px;
  }

  .request-drawer__section-title {
    font-size: 14px;
  }

  .request-drawer__timeline-item,
  .request-drawer__details-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>

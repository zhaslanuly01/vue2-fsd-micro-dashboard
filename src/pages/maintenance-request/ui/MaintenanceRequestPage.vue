<template>
  <div class="request-page">
    <div class="request-page__header">
      <div>
        <h1 class="request-page__title">Заявки на обслуживание</h1>
        <p class="request-page__subtitle">
          Контроль статусов, сроков, стоимости и распределения по командам
        </p>
      </div>

      <el-button @click="handleResetFilters">Сбросить фильтры</el-button>
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

        <el-table-column prop="createdAt" label="Создана" min-width="170" />
        <el-table-column prop="plannedDate" label="Плановая дата" min-width="140" />
        <el-table-column prop="completedAt" label="Завершена" min-width="140">
          <template #default="{ row }">
            {{ row.completedAt || '—' }}
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
      size="460px"
      direction="rtl"
      :before-close="handleCloseDrawer"
    >
      <div v-if="selectedRequest" class="request-drawer">
        <div class="request-drawer__hero">
          <div>
            <div class="request-drawer__eyebrow">Заявка на обслуживание</div>
            <div class="request-drawer__title">{{ selectedRequest.title }}</div>
            <div class="request-drawer__subtitle">
              {{ selectedRequest.objectName }} · {{ selectedRequest.fieldName }}
            </div>
          </div>

          <el-tag :type="getStatusTagType(selectedRequest.status)" effect="dark">
            {{ formatStatus(selectedRequest.status) }}
          </el-tag>
        </div>

        <div class="request-drawer__metrics">
          <el-card shadow="never" class="request-drawer__metric-card">
            <div class="request-drawer__metric-label">Стоимость</div>
            <div class="request-drawer__metric-value">{{ formatMoney(selectedRequest.cost) }}</div>
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
            <div class="request-drawer__metric-value">{{ selectedRequest.plannedDate }}</div>
          </el-card>
        </div>

        <el-card shadow="never" class="request-drawer__timeline-card">
          <div class="request-drawer__section-title">Жизненный цикл</div>

          <div class="request-drawer__timeline-list">
            <div class="request-drawer__timeline-item">
              <span>Создана</span>
              <b>{{ selectedRequest.createdAt }}</b>
            </div>
            <div class="request-drawer__timeline-item">
              <span>План выполнения</span>
              <b>{{ selectedRequest.plannedDate }}</b>
            </div>
            <div class="request-drawer__timeline-item">
              <span>Фактическое завершение</span>
              <b>{{ selectedRequest.completedAt || 'Не завершена' }}</b>
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

export default Vue.extend({
  name: 'MaintenanceRequestPage',

  components: {
    MaintenanceRequestKpi,
    MaintenanceRequestMap,
    MaintenanceRequestStatusChart,
    MaintenanceRequestCostChart
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
      const map: Record<RequestStatus, string> = {
        new: 'Новая',
        in_progress: 'В работе',
        completed: 'Завершена',
        overdue: 'Просрочена'
      }

      return map[status]
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
      const map: Record<RequestStatus, string> = {
        new: 'info',
        in_progress: 'warning',
        completed: 'success',
        overdue: 'danger'
      }

      return map[status]
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
    }
  },

  mounted() {
    this.$store.dispatch('maintenanceRequest/fetchMaintenanceRequests')
  }
})
</script>

<style scoped>
.request-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.request-page__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--label-primary);
}

.request-page__subtitle {
  margin: 8px 0 0;
  color: var(--label-secondary);
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

.request-page__empty {
  padding: 24px 0;
  color: var(--label-secondary);
}

.request-drawer {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f7f8fa;
  min-height: 100%;
}

.request-drawer__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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
}

.request-drawer__subtitle {
  margin-top: 6px;
  color: var(--label-secondary);
}

.request-drawer__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.request-drawer__metric-card,
.request-drawer__timeline-card,
.request-drawer__details-card {
  border-radius: 16px;
}

.request-drawer__metric-label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.request-drawer__metric-value {
  font-size: 20px;
  font-weight: 700;
}

.request-drawer__section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
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

@media (max-width: 1280px) {
  .request-page__analytics-grid {
    grid-template-columns: 1fr;
  }

  .request-page__filters-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .request-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .request-page__filters-grid {
    grid-template-columns: 1fr;
  }

  .request-drawer__metrics {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div class="equipment-page">
    <div class="equipment-page__header">
      <div class="equipment-page__header-text">
        <h1 class="equipment-page__title">Оборудование</h1>
        <p class="equipment-page__subtitle">
          Мониторинг состояния, эффективности и сервисного цикла оборудования
        </p>
      </div>

      <el-button class="equipment-page__reset-button" @click="handleResetFilters">
        Сбросить фильтры
      </el-button>
    </div>

    <EquipmentKpi :loading="loading" />

    <div class="equipment-page__analytics-grid">
      <div class="equipment-page__analytics-main">
        <EquipmentMap :loading="loading" />
      </div>

      <div class="equipment-page__analytics-side">
        <EquipmentStatusChart :loading="loading" />
        <EquipmentMaintenanceList :loading="loading" />
      </div>
    </div>

    <el-card shadow="never" class="equipment-page__filters">
      <div class="equipment-page__filters-grid">
        <el-input
          :value="filters.search"
          placeholder="Поиск по названию, типу, месторождению..."
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

        <el-select :value="filters.type" placeholder="Тип" clearable @change="handleTypeChange">
          <el-option
            v-for="type in types"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </div>
    </el-card>

    <el-card shadow="never" class="equipment-page__table-card">
      <div class="equipment-page__table-meta">
        <span>Найдено записей: {{ total }}</span>
      </div>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        class="equipment-page__alert"
      />

      <el-table
        v-loading="loading"
        :data="paginatedItems"
        border
        stripe
        class="equipment-page__table"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="name" label="Название" min-width="180" />
        <el-table-column prop="type" label="Тип" min-width="140">
          <template #default="{ row }">
            {{ formatType(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="fieldName" label="Месторождение" min-width="180" />

        <el-table-column prop="status" label="Статус" min-width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="plain">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="efficiency" label="Эффективность" min-width="150" sortable="custom">
          <template #default="{ row }">
            <div class="equipment-page__progress-cell">
              <el-progress
                :percentage="row.efficiency"
                :stroke-width="12"
                :status="getEfficiencyStatus(row.efficiency)"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="temperature" label="Температура" min-width="130" sortable="custom" />
        <el-table-column prop="pressure" label="Давление" min-width="120" sortable="custom" />
        <el-table-column prop="runtimeHours" label="Моточасы" min-width="130" sortable="custom" />
        <el-table-column prop="nextMaintenanceDate" label="След. ТО" min-width="140" />

        <template #empty>
          <div class="equipment-page__empty">
            <span v-if="loading">Загрузка данных...</span>
            <span v-else>По текущим фильтрам ничего не найдено</span>
          </div>
        </template>
      </el-table>

      <div class="equipment-page__pagination">
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
      custom-class="equipment-page__drawer"
    >
      <div v-if="selectedEquipment" class="equipment-drawer">
        <div class="equipment-drawer__header">
          <div class="equipment-drawer__header-text">
            <div class="equipment-drawer__eyebrow">Единица оборудования</div>
            <div class="equipment-drawer__title">{{ selectedEquipment.name }}</div>
            <div class="equipment-drawer__subtitle">
              {{ formatType(selectedEquipment.type) }} · {{ selectedEquipment.fieldName }}
            </div>
          </div>

          <button
            type="button"
            class="equipment-drawer__close"
            aria-label="Закрыть"
            @click="handleCloseDrawer"
          >
            ×
          </button>
        </div>

        <div class="equipment-drawer__content">
          <div class="equipment-drawer__hero">
            <el-tag :type="getStatusTagType(selectedEquipment.status)" effect="dark">
              {{ formatStatus(selectedEquipment.status) }}
            </el-tag>
          </div>

          <div class="equipment-drawer__metrics">
            <el-card shadow="never" class="equipment-drawer__metric-card">
              <div class="equipment-drawer__metric-label">Эффективность</div>
              <div class="equipment-drawer__metric-value">{{ selectedEquipment.efficiency }}%</div>
            </el-card>

            <el-card shadow="never" class="equipment-drawer__metric-card">
              <div class="equipment-drawer__metric-label">Моточасы</div>
              <div class="equipment-drawer__metric-value">
                {{ formatNumber(selectedEquipment.runtimeHours) }}
              </div>
            </el-card>

            <el-card shadow="never" class="equipment-drawer__metric-card">
              <div class="equipment-drawer__metric-label">Температура</div>
              <div class="equipment-drawer__metric-value">
                {{ selectedEquipment.temperature }}°C
              </div>
            </el-card>

            <el-card shadow="never" class="equipment-drawer__metric-card">
              <div class="equipment-drawer__metric-label">Давление</div>
              <div class="equipment-drawer__metric-value">
                {{ selectedEquipment.pressure }}
              </div>
            </el-card>
          </div>

          <el-card shadow="never" class="equipment-drawer__health-card">
            <div class="equipment-drawer__section-title">Техническое состояние</div>

            <div class="equipment-drawer__health-progress">
              <el-progress
                :percentage="selectedEquipment.efficiency"
                :stroke-width="progressStrokeWidth"
                :show-text="showHealthProgressText"
                :status="getEfficiencyStatus(selectedEquipment.efficiency)"
              />
            </div>

            <div class="equipment-drawer__health-hint">
              Следующее обслуживание: {{ selectedEquipment.nextMaintenanceDate }}
            </div>
          </el-card>

          <el-card shadow="never" class="equipment-drawer__details-card">
            <div class="equipment-drawer__section-title">Технический паспорт</div>

            <div class="equipment-drawer__details-list">
              <div class="equipment-drawer__details-item">
                <span>ID</span>
                <b>{{ selectedEquipment.id }}</b>
              </div>
              <div class="equipment-drawer__details-item">
                <span>Тип</span>
                <b>{{ formatType(selectedEquipment.type) }}</b>
              </div>
              <div class="equipment-drawer__details-item">
                <span>Месторождение</span>
                <b>{{ selectedEquipment.fieldName }}</b>
              </div>
              <div class="equipment-drawer__details-item">
                <span>Дата установки</span>
                <b>{{ selectedEquipment.installDate }}</b>
              </div>
              <div class="equipment-drawer__details-item">
                <span>Следующее ТО</span>
                <b>{{ selectedEquipment.nextMaintenanceDate }}</b>
              </div>
              <div class="equipment-drawer__details-item">
                <span>Координаты</span>
                <b>{{ selectedEquipment.lat }}, {{ selectedEquipment.lng }}</b>
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
  EquipmentFilters,
  EquipmentStatus,
  EquipmentType,
  EquipmentUnit
} from '@/entities/equipment/model/equipment.types'
import { EquipmentKpi } from '@/widgets/equipment/equipment-kpi'
import { EquipmentMap } from '@/widgets/equipment/equipment-map'
import { EquipmentStatusChart } from '@/widgets/equipment/equipment-status-chart'
import { EquipmentMaintenanceList } from '@/widgets/equipment/equipment-maintenance-list'

export default Vue.extend({
  name: 'EquipmentPage',

  components: {
    EquipmentKpi,
    EquipmentMap,
    EquipmentStatusChart,
    EquipmentMaintenanceList
  },

  data() {
    return {
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1440
    }
  },

  computed: {
    loading(): boolean {
      return this.$store.state.equipment.loading
    },

    error(): string | null {
      return this.$store.state.equipment.error
    },

    filters(): EquipmentFilters {
      return this.$store.state.equipment.filters
    },

    selectedEquipment(): EquipmentUnit | null {
      return this.$store.state.equipment.selectedEquipment
    },

    paginatedItems(): EquipmentUnit[] {
      return this.$store.getters['equipment/paginatedItems']
    },

    total(): number {
      return this.$store.getters['equipment/total']
    },

    statuses(): Array<{ label: string; value: string }> {
      return this.$store.getters['equipment/statuses']
    },

    fieldNames(): string[] {
      return this.$store.getters['equipment/fieldNames']
    },

    types(): Array<{ label: string; value: EquipmentType }> {
      return this.$store.getters['equipment/types']
    },

    highlightedEquipmentId(): number | null {
      return this.$store.state.equipment.highlightedEquipmentId
    },

    isMobile(): boolean {
      return this.windowWidth <= 575
    },

    drawerSize(): string {
      if (this.windowWidth <= 575) return '100%'
      if (this.windowWidth <= 991) return '72%'
      return '460px'
    },

    progressStrokeWidth(): number {
      return this.isMobile ? 12 : 16
    },

    showHealthProgressText(): boolean {
      return !this.isMobile
    },

    isDrawerVisible: {
      get(): boolean {
        return Boolean(this.selectedEquipment)
      },
      set(value: boolean) {
        if (!value) {
          this.$store.dispatch('equipment/closeDetails')
        }
      }
    }
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
    },

    handleSearchInput(value: string) {
      this.$store.dispatch('equipment/updateFilters', { search: value })
    },

    handleStatusChange(value: string) {
      this.$store.dispatch('equipment/updateFilters', { status: value || '' })
    },

    handleFieldChange(value: string) {
      this.$store.dispatch('equipment/updateFilters', { fieldName: value || '' })
    },

    handleTypeChange(value: string) {
      this.$store.dispatch('equipment/updateFilters', { type: value || '' })
    },

    handlePageChange(page: number) {
      this.$store.dispatch('equipment/changePage', page)
    },

    handlePageSizeChange(pageSize: number) {
      this.$store.dispatch('equipment/changePageSize', pageSize)
    },

    handleResetFilters() {
      this.$store.dispatch('equipment/resetFilters')
    },

    handleRowClick(row: EquipmentUnit) {
      this.$store.dispatch('equipment/selectEquipment', row)
    },

    handleCloseDrawer() {
      this.$store.dispatch('equipment/closeDetails')
    },

    handleSortChange({
      prop,
      order
    }: {
      column: unknown
      prop: string
      order: '' | 'ascending' | 'descending'
    }) {
      this.$store.dispatch('equipment/changeSorting', {
        sortBy: prop || '',
        sortOrder: order || ''
      })
    },

    getRowClassName({ row }: { row: EquipmentUnit }) {
      return this.highlightedEquipmentId === row.id ? 'equipment-table__row--highlighted' : ''
    },

    formatStatus(status: EquipmentStatus) {
      const map: Record<EquipmentStatus, string> = {
        operational: 'Работает',
        warning: 'Предупреждение',
        critical: 'Критическое',
        offline: 'Оффлайн'
      }

      return map[status]
    },

    formatType(type: EquipmentType) {
      const map: Record<EquipmentType, string> = {
        pump: 'Насос',
        compressor: 'Компрессор',
        separator: 'Сепаратор',
        generator: 'Генератор'
      }

      return map[type]
    },

    getStatusTagType(status: EquipmentStatus) {
      const map: Record<EquipmentStatus, string> = {
        operational: 'success',
        warning: 'warning',
        critical: 'danger',
        offline: 'info'
      }

      return map[status]
    },

    getEfficiencyStatus(value: number): '' | 'success' | 'warning' | 'exception' {
      if (value < 60) return 'exception'
      if (value < 80) return 'warning'
      return 'success'
    },

    formatNumber(value: number): string {
      return new Intl.NumberFormat('ru-RU').format(value)
    }
  },

  mounted() {
    this.$store.dispatch('equipment/fetchEquipment')
    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  }
})
</script>

<style scoped>
.equipment-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.equipment-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.equipment-page__header-text {
  min-width: 0;
}

.equipment-page__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--label-primary);
  word-break: break-word;
}

.equipment-page__subtitle {
  margin: 8px 0 0;
  color: var(--label-secondary);
  word-break: break-word;
}

.equipment-page__reset-button {
  flex-shrink: 0;
}

.equipment-page__analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(340px, 0.9fr);
  gap: 16px;
  align-items: stretch;
}

.equipment-page__analytics-main,
.equipment-page__analytics-side {
  min-width: 0;
}

.equipment-page__analytics-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.equipment-page__filters,
.equipment-page__table-card {
  border-radius: 18px;
}

.equipment-page__filters-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px;
}

.equipment-page__table-meta {
  margin-bottom: 16px;
  color: var(--label-secondary);
  word-break: break-word;
}

.equipment-page__alert {
  margin-bottom: 16px;
}

.equipment-page__table {
  width: 100%;
}

.equipment-page__table :deep(.equipment-table__row--highlighted > td) {
  background-color: #ecf5ff !important;
}

.equipment-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.equipment-page__pagination :deep(.el-pagination) {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.equipment-page__empty {
  padding: 24px 0;
  color: var(--label-secondary);
}

.equipment-page__progress-cell {
  min-width: 120px;
}

.equipment-drawer {
  min-height: 100%;
  background: #f7f8fa;
}

.equipment-drawer__header {
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

.equipment-drawer__header-text {
  min-width: 0;
}

.equipment-drawer__close {
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

.equipment-drawer__content {
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.equipment-drawer__hero {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
}

.equipment-drawer__eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--label-secondary);
  margin-bottom: 6px;
}

.equipment-drawer__title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--label-primary);
  word-break: break-word;
}

.equipment-drawer__subtitle {
  margin-top: 6px;
  color: var(--label-secondary);
  word-break: break-word;
}

.equipment-drawer__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-width: 0;
}

.equipment-drawer__metric-card,
.equipment-drawer__health-card,
.equipment-drawer__details-card {
  border-radius: 16px;
  min-width: 0;
}

.equipment-drawer__metric-label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.equipment-drawer__metric-value {
  font-size: 22px;
  font-weight: 700;
  word-break: break-word;
}

.equipment-drawer__section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.35;
  word-break: break-word;
}

.equipment-drawer__health-progress {
  width: 100%;
  min-width: 0;
}

.equipment-drawer__health-progress :deep(.el-progress) {
  width: 100%;
}

.equipment-drawer__health-hint {
  margin-top: 10px;
  font-size: 13px;
  color: var(--label-secondary);
  word-break: break-word;
}

.equipment-drawer__details-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.equipment-drawer__details-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.equipment-drawer__details-item:last-child {
  border-bottom: none;
}

.equipment-drawer__details-item span,
.equipment-drawer__details-item b {
  word-break: break-word;
}

:deep(.equipment-page__drawer) {
  max-width: 100%;
}

:deep(.equipment-page__drawer .el-drawer) {
  height: 100dvh !important;
  max-height: 100dvh !important;
  overflow: hidden;
}

:deep(.equipment-page__drawer .el-drawer__body) {
  height: 100%;
  overflow-y: auto !important;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 1280px) {
  .equipment-page__analytics-grid {
    grid-template-columns: 1fr;
  }

  .equipment-page__filters-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 991px) {
  .equipment-page__title {
    font-size: 24px;
  }

  .equipment-page__pagination {
    justify-content: flex-start;
  }

  .equipment-page__pagination :deep(.el-pagination) {
    justify-content: flex-start;
  }

  .equipment-drawer__header {
    padding: 16px;
  }

  .equipment-drawer__content {
    padding: 12px 16px 20px;
  }
}

@media (max-width: 768px) {
  .equipment-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .equipment-page__reset-button {
    width: 100%;
  }

  .equipment-page__filters-grid {
    grid-template-columns: 1fr;
  }

  .equipment-drawer__metrics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575px) {
  .equipment-page__title {
    font-size: 22px;
  }

  .equipment-page__subtitle {
    font-size: 14px;
  }

  .equipment-page__filters,
  .equipment-page__table-card {
    border-radius: 14px;
  }

  .equipment-page__table-meta {
    margin-bottom: 12px;
    font-size: 14px;
  }

  .equipment-page__progress-cell {
    min-width: 100px;
  }

  .equipment-drawer__header {
    padding: 12px;
  }

  .equipment-drawer__content {
    padding: 12px 12px 20px;
    gap: 12px;
  }

  .equipment-drawer__title {
    font-size: 22px;
  }

  .equipment-drawer__subtitle {
    font-size: 13px;
  }

  .equipment-drawer__close {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    font-size: 22px;
  }

  .equipment-drawer__metric-card,
  .equipment-drawer__health-card,
  .equipment-drawer__details-card {
    border-radius: 12px;
  }

  .equipment-drawer__metric-value {
    font-size: 18px;
  }

  .equipment-drawer__section-title {
    font-size: 14px;
  }

  .equipment-drawer__details-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>

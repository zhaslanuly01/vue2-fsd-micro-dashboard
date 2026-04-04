<template>
  <div class="eco-page">
    <div class="eco-page__header">
      <div class="eco-page__header-text">
        <h1 class="eco-page__title">Экологические станции</h1>
        <p class="eco-page__subtitle">Мониторинг выбросов, газовых показателей и качества воды</p>
      </div>

      <el-button class="eco-page__reset-button" @click="handleResetFilters">
        Сбросить фильтры
      </el-button>
    </div>

    <EcoStationKpi :loading="loading" />

    <div class="eco-page__analytics-grid">
      <div class="eco-page__analytics-main">
        <EcoStationMap :loading="loading" />
      </div>

      <div class="eco-page__analytics-side">
        <EcoStationStatusChart :loading="loading" />
        <EcoStationEmissionChart :loading="loading" />
      </div>
    </div>

    <el-card shadow="never" class="eco-page__filters">
      <div class="eco-page__filters-grid">
        <el-input
          :value="filters.search"
          placeholder="Поиск по станции, месторождению, региону..."
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
          :value="filters.region"
          placeholder="Регион"
          clearable
          @change="handleRegionChange"
        >
          <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
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
          :value="filters.responsibleUnit"
          placeholder="Ответственное подразделение"
          clearable
          @change="handleResponsibleUnitChange"
        >
          <el-option v-for="unit in responsibleUnits" :key="unit" :label="unit" :value="unit" />
        </el-select>
      </div>
    </el-card>

    <el-alert v-if="error" :title="error" type="error" :closable="false" class="eco-page__alert" />

    <el-skeleton v-if="loading" :rows="6" animated />

    <el-card v-else shadow="never" class="eco-page__table-card">
      <div class="eco-page__table-meta">
        <span>Найдено записей: {{ total }}</span>
      </div>

      <el-table
        ref="ecoTable"
        v-loading="loading"
        :data="paginatedItems"
        border
        stripe
        class="eco-page__table"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="stationName" label="Станция" min-width="190" />
        <el-table-column prop="fieldName" label="Месторождение" min-width="160" />
        <el-table-column prop="region" label="Регион" min-width="180" />

        <el-table-column prop="status" label="Статус" min-width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="plain">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="measurementDate" label="Дата замера" min-width="140" />
        <el-table-column prop="emissionLevel" label="Выбросы" min-width="120" sortable="custom" />
        <el-table-column prop="co2Level" label="CO₂" min-width="100" sortable="custom" />
        <el-table-column prop="h2sLevel" label="H₂S" min-width="100" sortable="custom" />
        <el-table-column
          prop="waterQualityIndex"
          label="Индекс воды"
          min-width="150"
          sortable="custom"
        >
          <template #default="{ row }">
            <div class="eco-page__progress-cell">
              <el-progress
                :percentage="row.waterQualityIndex"
                :stroke-width="12"
                :status="getWaterQualityStatus(row.waterQualityIndex)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="responsibleUnit" label="Подразделение" min-width="180" />

        <template #empty>
          <div class="eco-page__empty">
            <span v-if="loading">Загрузка данных...</span>
            <span v-else>По текущим фильтрам ничего не найдено</span>
          </div>
        </template>
      </el-table>

      <div class="eco-page__pagination">
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
      custom-class="eco-page__drawer"
    >
      <div v-if="selectedStation" class="eco-drawer">
        <div class="eco-drawer__header">
          <div class="eco-drawer__header-text">
            <div class="eco-drawer__eyebrow">Экологическая станция</div>
            <div class="eco-drawer__title">{{ selectedStation.stationName }}</div>
            <div class="eco-drawer__subtitle">
              {{ selectedStation.fieldName }} · {{ selectedStation.region }}
            </div>
          </div>

          <button
            type="button"
            class="eco-drawer__close"
            aria-label="Закрыть"
            @click="handleCloseDrawer"
          >
            ×
          </button>
        </div>

        <div class="eco-drawer__content">
          <div class="eco-drawer__hero">
            <el-tag :type="getStatusTagType(selectedStation.status)" effect="dark">
              {{ formatStatus(selectedStation.status) }}
            </el-tag>
          </div>

          <div class="eco-drawer__metrics">
            <el-card shadow="never" class="eco-drawer__metric-card">
              <div class="eco-drawer__metric-label">Выбросы</div>
              <div class="eco-drawer__metric-value">{{ selectedStation.emissionLevel }}</div>
            </el-card>

            <el-card shadow="never" class="eco-drawer__metric-card">
              <div class="eco-drawer__metric-label">CO₂</div>
              <div class="eco-drawer__metric-value">{{ selectedStation.co2Level }}</div>
            </el-card>

            <el-card shadow="never" class="eco-drawer__metric-card">
              <div class="eco-drawer__metric-label">H₂S</div>
              <div class="eco-drawer__metric-value">{{ selectedStation.h2sLevel }}</div>
            </el-card>

            <el-card shadow="never" class="eco-drawer__metric-card">
              <div class="eco-drawer__metric-label">Индекс воды</div>
              <div class="eco-drawer__metric-value">{{ selectedStation.waterQualityIndex }}</div>
            </el-card>
          </div>

          <el-card shadow="never" class="eco-drawer__water-card">
            <div class="eco-drawer__section-title">Качество воды</div>

            <div class="eco-drawer__water-progress">
              <el-progress
                :percentage="selectedStation.waterQualityIndex"
                :stroke-width="progressStrokeWidth"
                :show-text="showWaterProgressText"
                :status="getWaterQualityStatus(selectedStation.waterQualityIndex)"
              />
            </div>

            <div class="eco-drawer__water-hint">
              Последний замер: {{ selectedStation.measurementDate }}
            </div>
          </el-card>

          <el-card shadow="never" class="eco-drawer__details-card">
            <div class="eco-drawer__section-title">Паспорт станции</div>

            <div class="eco-drawer__details-list">
              <div class="eco-drawer__details-item">
                <span>ID</span>
                <b>{{ selectedStation.id }}</b>
              </div>
              <div class="eco-drawer__details-item">
                <span>Станция</span>
                <b>{{ selectedStation.stationName }}</b>
              </div>
              <div class="eco-drawer__details-item">
                <span>Месторождение</span>
                <b>{{ selectedStation.fieldName }}</b>
              </div>
              <div class="eco-drawer__details-item">
                <span>Регион</span>
                <b>{{ selectedStation.region }}</b>
              </div>
              <div class="eco-drawer__details-item">
                <span>Подразделение</span>
                <b>{{ selectedStation.responsibleUnit }}</b>
              </div>
              <div class="eco-drawer__details-item">
                <span>Координаты</span>
                <b>{{ selectedStation.lat }}, {{ selectedStation.lng }}</b>
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
  EcoStation,
  EcoStationFilters,
  EcoStatus
} from '@/entities/eco-station/model/eco-station.types'
import { EcoStationKpi } from '@/widgets/eco-station/eco-station-kpi'
import { EcoStationMap } from '@/widgets/eco-station/eco-station-map'
import { EcoStationStatusChart } from '@/widgets/eco-station/eco-station-status-chart'
import { EcoStationEmissionChart } from '@/widgets/eco-station/eco-station-emission-chart'

export default Vue.extend({
  name: 'EcoStationPage',

  components: {
    EcoStationKpi,
    EcoStationMap,
    EcoStationStatusChart,
    EcoStationEmissionChart
  },

  data() {
    return {
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1440
    }
  },

  computed: {
    loading(): boolean {
      return this.$store.state.ecoStation.loading
    },

    error(): string | null {
      return this.$store.state.ecoStation.error
    },

    filters(): EcoStationFilters {
      return this.$store.state.ecoStation.filters
    },

    selectedStation(): EcoStation | null {
      return this.$store.state.ecoStation.selectedStation
    },

    paginatedItems(): EcoStation[] {
      return this.$store.getters['ecoStation/paginatedItems']
    },

    total(): number {
      return this.$store.getters['ecoStation/total']
    },

    statuses(): Array<{ label: string; value: string }> {
      return this.$store.getters['ecoStation/statuses']
    },

    regions(): string[] {
      return this.$store.getters['ecoStation/regions']
    },

    fieldNames(): string[] {
      return this.$store.getters['ecoStation/fieldNames']
    },

    responsibleUnits(): string[] {
      return this.$store.getters['ecoStation/responsibleUnits']
    },

    highlightedStationId(): number | null {
      return this.$store.state.ecoStation.highlightedStationId
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

    showWaterProgressText(): boolean {
      return !this.isMobile
    },

    isDrawerVisible: {
      get(): boolean {
        return Boolean(this.selectedStation)
      },
      set(value: boolean) {
        if (!value) {
          this.$store.dispatch('ecoStation/closeDetails')
        }
      }
    }
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
    },

    handleSearchInput(value: string) {
      this.$store.dispatch('ecoStation/updateFilters', { search: value })
    },

    handleStatusChange(value: string) {
      this.$store.dispatch('ecoStation/updateFilters', { status: value || '' })
    },

    handleRegionChange(value: string) {
      this.$store.dispatch('ecoStation/updateFilters', { region: value || '' })
    },

    handleFieldChange(value: string) {
      this.$store.dispatch('ecoStation/updateFilters', { fieldName: value || '' })
    },

    handleResponsibleUnitChange(value: string) {
      this.$store.dispatch('ecoStation/updateFilters', { responsibleUnit: value || '' })
    },

    handlePageChange(page: number) {
      this.$store.dispatch('ecoStation/changePage', page)
    },

    handlePageSizeChange(pageSize: number) {
      this.$store.dispatch('ecoStation/changePageSize', pageSize)
    },

    handleResetFilters() {
      this.$store.dispatch('ecoStation/resetFilters')
    },

    handleRowClick(row: EcoStation) {
      this.$store.dispatch('ecoStation/selectStation', row)
    },

    handleCloseDrawer() {
      this.$store.dispatch('ecoStation/closeDetails')
    },

    handleSortChange({
      prop,
      order
    }: {
      column: unknown
      prop: string
      order: '' | 'ascending' | 'descending'
    }) {
      this.$store.dispatch('ecoStation/changeSorting', {
        sortBy: prop || '',
        sortOrder: order || ''
      })
    },

    getRowClassName({ row }: { row: EcoStation }) {
      return this.highlightedStationId === row.id ? 'eco-table__row--highlighted' : ''
    },

    formatStatus(status: EcoStatus) {
      const map: Record<EcoStatus, string> = {
        normal: 'Норма',
        attention: 'Внимание',
        critical: 'Критично'
      }

      return map[status]
    },

    getStatusTagType(status: EcoStatus) {
      const map: Record<EcoStatus, string> = {
        normal: 'success',
        attention: 'warning',
        critical: 'danger'
      }

      return map[status]
    },

    getWaterQualityStatus(value: number): '' | 'success' | 'warning' | 'exception' {
      if (value < 50) return 'exception'
      if (value < 75) return 'warning'
      return 'success'
    }
  },

  mounted() {
    this.$store.dispatch('ecoStation/fetchEcoStations').then(() => {
      this.$nextTick(() => {
        const table = this.$refs.ecoTable as any
        table?.doLayout?.()
      })
    })

    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  }
})
</script>

<style scoped>
.eco-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.eco-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eco-page__header-text {
  min-width: 0;
}

.eco-page__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--label-primary);
  word-break: break-word;
}

.eco-page__subtitle {
  margin: 8px 0 0;
  color: var(--label-secondary);
  word-break: break-word;
}

.eco-page__reset-button {
  flex-shrink: 0;
}

.eco-page__analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(340px, 0.9fr);
  gap: 16px;
  align-items: stretch;
}

.eco-page__analytics-main,
.eco-page__analytics-side {
  min-width: 0;
}

.eco-page__analytics-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.eco-page__filters,
.eco-page__table-card {
  border-radius: 18px;
}

.eco-page__filters-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(160px, 1fr));
  gap: 12px;
}

.eco-page__table-meta {
  margin-bottom: 16px;
  color: var(--label-secondary);
  word-break: break-word;
}

.eco-page__alert {
  margin-bottom: 16px;
}

.eco-page__table {
  width: 100%;
}

.eco-page__table :deep(.eco-table__row--highlighted > td) {
  background-color: #ecf5ff !important;
}

.eco-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.eco-page__pagination :deep(.el-pagination) {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.eco-page__empty {
  padding: 24px 0;
  color: var(--label-secondary);
}

.eco-page__progress-cell {
  min-width: 120px;
}

.eco-drawer {
  min-height: 100%;
  background: #f7f8fa;
}

.eco-drawer__header {
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

.eco-drawer__header-text {
  min-width: 0;
}

.eco-drawer__close {
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

.eco-drawer__content {
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.eco-drawer__hero {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
}

.eco-drawer__eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--label-secondary);
  margin-bottom: 6px;
}

.eco-drawer__title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--label-primary);
  word-break: break-word;
}

.eco-drawer__subtitle {
  margin-top: 6px;
  color: var(--label-secondary);
  word-break: break-word;
}

.eco-drawer__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-width: 0;
}

.eco-drawer__metric-card,
.eco-drawer__water-card,
.eco-drawer__details-card {
  border-radius: 16px;
  min-width: 0;
}

.eco-drawer__metric-label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.eco-drawer__metric-value {
  font-size: 22px;
  font-weight: 700;
  word-break: break-word;
}

.eco-drawer__section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.35;
  word-break: break-word;
}

.eco-drawer__water-progress {
  width: 100%;
  min-width: 0;
}

.eco-drawer__water-progress :deep(.el-progress) {
  width: 100%;
}

.eco-drawer__water-hint {
  margin-top: 10px;
  font-size: 13px;
  color: var(--label-secondary);
  word-break: break-word;
}

.eco-drawer__details-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eco-drawer__details-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.eco-drawer__details-item:last-child {
  border-bottom: none;
}

.eco-drawer__details-item span,
.eco-drawer__details-item b {
  word-break: break-word;
}

:deep(.eco-page__drawer) {
  max-width: 100%;
}

:deep(.eco-page__drawer .el-drawer) {
  height: 100dvh !important;
  max-height: 100dvh !important;
  overflow: hidden;
}

:deep(.eco-page__drawer .el-drawer__body) {
  height: 100%;
  overflow-y: auto !important;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 1280px) {
  .eco-page__analytics-grid {
    grid-template-columns: 1fr;
  }

  .eco-page__filters-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 991px) {
  .eco-page__title {
    font-size: 24px;
  }

  .eco-page__pagination {
    justify-content: flex-start;
  }

  .eco-page__pagination :deep(.el-pagination) {
    justify-content: flex-start;
  }

  .eco-drawer__header {
    padding: 16px;
  }

  .eco-drawer__content {
    padding: 12px 16px 20px;
  }
}

@media (max-width: 768px) {
  .eco-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .eco-page__reset-button {
    width: 100%;
  }

  .eco-page__filters-grid {
    grid-template-columns: 1fr;
  }

  .eco-drawer__metrics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575px) {
  .eco-page__title {
    font-size: 22px;
  }

  .eco-page__subtitle {
    font-size: 14px;
  }

  .eco-page__filters,
  .eco-page__table-card {
    border-radius: 14px;
  }

  .eco-page__table-meta {
    margin-bottom: 12px;
    font-size: 14px;
  }

  .eco-page__progress-cell {
    min-width: 100px;
  }

  .eco-drawer__header {
    padding: 12px;
  }

  .eco-drawer__content {
    padding: 12px 12px 20px;
    gap: 12px;
  }

  .eco-drawer__title {
    font-size: 22px;
  }

  .eco-drawer__subtitle {
    font-size: 13px;
  }

  .eco-drawer__close {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    font-size: 22px;
  }

  .eco-drawer__metric-card,
  .eco-drawer__water-card,
  .eco-drawer__details-card {
    border-radius: 12px;
  }

  .eco-drawer__metric-value {
    font-size: 18px;
  }

  .eco-drawer__section-title {
    font-size: 14px;
  }

  .eco-drawer__details-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>

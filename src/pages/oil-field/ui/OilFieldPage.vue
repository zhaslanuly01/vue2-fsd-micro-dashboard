<template>
  <div class="oil-field-page">
    <div class="oil-field-page__header">
      <div class="oil-field-page__header-text">
        <h1 class="oil-field-page__title">Нефтяные месторождения</h1>
        <p class="oil-field-page__subtitle">
          Контроль добычи, исполнения плана и активности фонда скважин
        </p>
      </div>

      <el-button class="oil-field-page__reset-button" @click="handleResetFilters">
        Сбросить фильтры
      </el-button>
    </div>

    <OilFieldKpi :loading="loading" />

    <div class="oil-field-page__analytics-grid">
      <div class="oil-field-page__analytics-main">
        <OilFieldMap :loading="loading" />
      </div>

      <div class="oil-field-page__analytics-side">
        <OilFieldStatusChart :loading="loading" />
        <OilFieldProductionChart :loading="loading" />
      </div>
    </div>

    <el-card shadow="never" class="oil-field-page__filters">
      <div class="oil-field-page__filters-grid">
        <el-input
          :value="filters.search"
          placeholder="Поиск по месторождению, региону, подрядчику..."
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
          :value="filters.contractor"
          placeholder="Подрядчик"
          clearable
          @change="handleContractorChange"
        >
          <el-option
            v-for="contractor in contractors"
            :key="contractor"
            :label="contractor"
            :value="contractor"
          />
        </el-select>
      </div>
    </el-card>

    <el-card shadow="never" class="oil-field-page__table-card">
      <div class="oil-field-page__table-meta">
        <span>Найдено записей: {{ total }}</span>
      </div>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        class="oil-field-page__alert"
      />

      <el-table
        v-loading="loading"
        :data="paginatedItems"
        border
        stripe
        class="oil-field-page__table"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="name" label="Месторождение" min-width="180" />
        <el-table-column prop="region" label="Регион" min-width="180" />

        <el-table-column prop="status" label="Статус" min-width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="plain">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="startDate" label="Дата запуска" min-width="130" />
        <el-table-column
          prop="dailyProduction"
          label="Суточная добыча"
          min-width="150"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatNumber(row.dailyProduction) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="monthlyProduction"
          label="Месячная добыча"
          min-width="150"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatNumber(row.monthlyProduction) }}
          </template>
        </el-table-column>
        <el-table-column prop="yearlyFact" label="Факт года" min-width="140" sortable="custom">
          <template #default="{ row }">
            {{ formatNumber(row.yearlyFact) }}
          </template>
        </el-table-column>
        <el-table-column prop="yearlyPlan" label="План года" min-width="140" sortable="custom">
          <template #default="{ row }">
            {{ formatNumber(row.yearlyPlan) }}
          </template>
        </el-table-column>

        <el-table-column label="Исполнение плана" min-width="170">
          <template #default="{ row }">
            <div class="oil-field-page__progress-cell">
              <el-progress
                :percentage="getPlanExecution(row)"
                :stroke-width="12"
                :status="getPlanExecutionStatus(getPlanExecution(row))"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Активные скважины" min-width="160">
          <template #default="{ row }"> {{ row.activeWells }} / {{ row.totalWells }} </template>
        </el-table-column>

        <el-table-column prop="contractor" label="Подрядчик" min-width="180" />

        <template #empty>
          <div class="oil-field-page__empty">
            <span v-if="loading">Загрузка данных...</span>
            <span v-else>По текущим фильтрам ничего не найдено</span>
          </div>
        </template>
      </el-table>

      <div class="oil-field-page__pagination">
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

    <AiAssistantButton @click="isAiOpen = true" />

    <AiAssistantDrawer
      :visible.sync="isAiOpen"
      page="oil-field"
      :filters="aiFilters"
      :selected-item="selectedField"
      :stats="aiStats"
    />

    <el-drawer
      :visible.sync="isDrawerVisible"
      :with-header="false"
      :size="drawerSize"
      direction="rtl"
      :before-close="handleCloseDrawer"
      custom-class="oil-field-page__drawer"
    >
      <div v-if="selectedField" class="oil-field-drawer">
        <div class="oil-field-drawer__header">
          <div class="oil-field-drawer__header-text">
            <div class="oil-field-drawer__eyebrow">Нефтяное месторождение</div>
            <div class="oil-field-drawer__title">{{ selectedField.name }}</div>
            <div class="oil-field-drawer__subtitle">
              {{ selectedField.region }} · {{ selectedField.contractor }}
            </div>
          </div>

          <button
            type="button"
            class="oil-field-drawer__close"
            aria-label="Закрыть"
            @click="handleCloseDrawer"
          >
            ×
          </button>
        </div>

        <div class="oil-field-drawer__content">
          <div class="oil-field-drawer__hero">
            <el-tag :type="getStatusTagType(selectedField.status)" effect="dark">
              {{ formatStatus(selectedField.status) }}
            </el-tag>
          </div>

          <div class="oil-field-drawer__metrics">
            <el-card shadow="never" class="oil-field-drawer__metric-card">
              <div class="oil-field-drawer__metric-label">Суточная добыча</div>
              <div class="oil-field-drawer__metric-value">
                {{ formatNumber(selectedField.dailyProduction) }}
              </div>
            </el-card>

            <el-card shadow="never" class="oil-field-drawer__metric-card">
              <div class="oil-field-drawer__metric-label">Месячная добыча</div>
              <div class="oil-field-drawer__metric-value">
                {{ formatNumber(selectedField.monthlyProduction) }}
              </div>
            </el-card>

            <el-card shadow="never" class="oil-field-drawer__metric-card">
              <div class="oil-field-drawer__metric-label">Активные скважины</div>
              <div class="oil-field-drawer__metric-value">
                {{ selectedField.activeWells }}
              </div>
            </el-card>

            <el-card shadow="never" class="oil-field-drawer__metric-card">
              <div class="oil-field-drawer__metric-label">Всего скважин</div>
              <div class="oil-field-drawer__metric-value">
                {{ selectedField.totalWells }}
              </div>
            </el-card>
          </div>

          <el-card shadow="never" class="oil-field-drawer__plan-card">
            <div class="oil-field-drawer__section-title">Исполнение годового плана</div>

            <div class="oil-field-drawer__plan-progress">
              <el-progress
                :percentage="getPlanExecution(selectedField)"
                :stroke-width="progressStrokeWidth"
                :show-text="showPlanProgressText"
                :status="getPlanExecutionStatus(getPlanExecution(selectedField))"
              />
            </div>

            <div class="oil-field-drawer__plan-meta">
              <span>Факт: {{ formatNumber(selectedField.yearlyFact) }}</span>
              <span>План: {{ formatNumber(selectedField.yearlyPlan) }}</span>
            </div>
          </el-card>

          <el-card shadow="never" class="oil-field-drawer__details-card">
            <div class="oil-field-drawer__section-title">Паспорт месторождения</div>

            <div class="oil-field-drawer__details-list">
              <div class="oil-field-drawer__details-item">
                <span>ID</span>
                <b>{{ selectedField.id }}</b>
              </div>
              <div class="oil-field-drawer__details-item">
                <span>Название</span>
                <b>{{ selectedField.name }}</b>
              </div>
              <div class="oil-field-drawer__details-item">
                <span>Регион</span>
                <b>{{ selectedField.region }}</b>
              </div>
              <div class="oil-field-drawer__details-item">
                <span>Дата запуска</span>
                <b>{{ selectedField.startDate }}</b>
              </div>
              <div class="oil-field-drawer__details-item">
                <span>Подрядчик</span>
                <b>{{ selectedField.contractor }}</b>
              </div>
              <div class="oil-field-drawer__details-item">
                <span>Координаты</span>
                <b>{{ selectedField.lat }}, {{ selectedField.lng }}</b>
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
  FieldStatus,
  OilField,
  OilFieldFilters
} from '@/entities/oil-field/model/oil-field.types'
import { OilFieldKpi } from '@/widgets/oil-field/oil-field-kpi'
import { OilFieldMap } from '@/widgets/oil-field/oil-field-map'
import { OilFieldStatusChart } from '@/widgets/oil-field/oil-field-status-chart'
import { OilFieldProductionChart } from '@/widgets/oil-field/oil-field-production-chart'
import { AiAssistantButton } from '@/features/ai-assistant'
import { AiAssistantDrawer } from '@/features/ai-assistant'

export default Vue.extend({
  name: 'OilFieldPage',

  components: {
    OilFieldKpi,
    OilFieldMap,
    OilFieldStatusChart,
    OilFieldProductionChart,
    AiAssistantButton,
    AiAssistantDrawer
  },

  data() {
    return {
      isAiOpen: false,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1440
    }
  },

  computed: {
    loading(): boolean {
      return this.$store.state.oilField.loading
    },

    error(): string | null {
      return this.$store.state.oilField.error
    },

    filters(): OilFieldFilters {
      return this.$store.state.oilField.filters
    },

    selectedField(): OilField | null {
      return this.$store.state.oilField.selectedField
    },

    paginatedItems(): OilField[] {
      return this.$store.getters['oilField/paginatedItems']
    },

    total(): number {
      return this.$store.getters['oilField/total']
    },

    statuses(): Array<{ label: string; value: string }> {
      return this.$store.getters['oilField/statuses']
    },

    regions(): string[] {
      return this.$store.getters['oilField/regions']
    },

    contractors(): string[] {
      return this.$store.getters['oilField/contractors']
    },

    highlightedFieldId(): number | null {
      return this.$store.state.oilField.highlightedFieldId
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

    showPlanProgressText(): boolean {
      return !this.isMobile
    },

    isDrawerVisible: {
      get(): boolean {
        return Boolean(this.selectedField)
      },
      set(value: boolean) {
        if (!value) {
          this.$store.dispatch('oilField/closeDetails')
        }
      }
    },

    aiFilters(): Record<string, unknown> {
      return {
        search: this.filters.search,
        status: this.filters.status,
        region: this.filters.region,
        contractor: this.filters.contractor,
        page: this.filters.page,
        pageSize: this.filters.pageSize
      }
    },

    aiStats(): Record<string, unknown> {
      const items = this.paginatedItems || []

      return {
        total: this.total,
        visible: items.length,
        stableCount: items.filter((item) => item.status === 'stable').length,
        growingCount: items.filter((item) => item.status === 'growing').length,
        decliningCount: items.filter((item) => item.status === 'declining').length,
        riskCount: items.filter((item) => item.status === 'risk').length,
        averagePlanExecution:
          items.length > 0
            ? Math.round(
                items.reduce((sum, item) => sum + this.getPlanExecution(item), 0) / items.length
              )
            : 0
      }
    }
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
    },

    handleSearchInput(value: string) {
      this.$store.dispatch('oilField/updateFilters', { search: value })
    },

    handleStatusChange(value: string) {
      this.$store.dispatch('oilField/updateFilters', { status: value || '' })
    },

    handleRegionChange(value: string) {
      this.$store.dispatch('oilField/updateFilters', { region: value || '' })
    },

    handleContractorChange(value: string) {
      this.$store.dispatch('oilField/updateFilters', { contractor: value || '' })
    },

    handlePageChange(page: number) {
      this.$store.dispatch('oilField/changePage', page)
    },

    handlePageSizeChange(pageSize: number) {
      this.$store.dispatch('oilField/changePageSize', pageSize)
    },

    handleResetFilters() {
      this.$store.dispatch('oilField/resetFilters')
    },

    handleRowClick(row: OilField) {
      this.$store.dispatch('oilField/selectField', row)
    },

    handleCloseDrawer() {
      this.$store.dispatch('oilField/closeDetails')
    },

    handleSortChange({
      prop,
      order
    }: {
      column: unknown
      prop: string
      order: '' | 'ascending' | 'descending'
    }) {
      this.$store.dispatch('oilField/changeSorting', {
        sortBy: prop || '',
        sortOrder: order || ''
      })
    },

    getRowClassName({ row }: { row: OilField }) {
      return this.highlightedFieldId === row.id ? 'oil-field-table__row--highlighted' : ''
    },

    formatStatus(status: FieldStatus) {
      const map: Record<FieldStatus, string> = {
        stable: 'Стабильное',
        growing: 'Рост',
        declining: 'Снижение',
        risk: 'Риск'
      }

      return map[status]
    },

    getStatusTagType(status: FieldStatus) {
      const map: Record<FieldStatus, string> = {
        stable: 'success',
        growing: '',
        declining: 'warning',
        risk: 'danger'
      }

      return map[status]
    },

    formatNumber(value: number): string {
      return new Intl.NumberFormat('ru-RU').format(value)
    },

    getPlanExecution(row: OilField): number {
      if (!row.yearlyPlan) return 0
      return Math.min(100, Math.round((row.yearlyFact / row.yearlyPlan) * 100))
    },

    getPlanExecutionStatus(value: number): '' | 'success' | 'warning' | 'exception' {
      if (value < 40) return 'exception'
      if (value < 70) return 'warning'
      return 'success'
    }
  },

  mounted() {
    this.$store.dispatch('oilField/fetchOilFields')
    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  }
})
</script>

<style scoped>
.oil-field-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.oil-field-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.oil-field-page__header-text {
  min-width: 0;
}

.oil-field-page__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--label-primary);
  word-break: break-word;
}

.oil-field-page__subtitle {
  margin: 8px 0 0;
  color: var(--label-secondary);
  word-break: break-word;
}

.oil-field-page__reset-button {
  flex-shrink: 0;
}

.oil-field-page__analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
  gap: 16px;
  align-items: stretch;
}

.oil-field-page__analytics-main,
.oil-field-page__analytics-side {
  min-width: 0;
}

.oil-field-page__analytics-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.oil-field-page__filters,
.oil-field-page__table-card {
  border-radius: 18px;
}

.oil-field-page__filters-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px;
}

.oil-field-page__table-meta {
  margin-bottom: 16px;
  color: var(--label-secondary);
  word-break: break-word;
}

.oil-field-page__alert {
  margin-bottom: 16px;
}

.oil-field-page__table {
  width: 100%;
}

.oil-field-page__table :deep(.oil-field-table__row--highlighted > td) {
  background-color: #ecf5ff !important;
}

.oil-field-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.oil-field-page__pagination :deep(.el-pagination) {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.oil-field-page__empty {
  padding: 24px 0;
  color: var(--label-secondary);
}

.oil-field-page__progress-cell {
  min-width: 120px;
}

.oil-field-drawer {
  min-height: 100%;
  background: #f7f8fa;
}

.oil-field-drawer__header {
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

.oil-field-drawer__header-text {
  min-width: 0;
}

.oil-field-drawer__close {
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

.oil-field-drawer__content {
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.oil-field-drawer__hero {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
}

.oil-field-drawer__eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--label-secondary);
  margin-bottom: 6px;
}

.oil-field-drawer__title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--label-primary);
  word-break: break-word;
}

.oil-field-drawer__subtitle {
  margin-top: 6px;
  color: var(--label-secondary);
  word-break: break-word;
}

.oil-field-drawer__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-width: 0;
}

.oil-field-drawer__metric-card,
.oil-field-drawer__plan-card,
.oil-field-drawer__details-card {
  border-radius: 16px;
  min-width: 0;
}

.oil-field-drawer__metric-label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.oil-field-drawer__metric-value {
  font-size: 20px;
  font-weight: 700;
  word-break: break-word;
}

.oil-field-drawer__section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.35;
  word-break: break-word;
}

.oil-field-drawer__plan-progress {
  width: 100%;
  min-width: 0;
}

.oil-field-drawer__plan-progress :deep(.el-progress) {
  width: 100%;
}

.oil-field-drawer__plan-meta {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--label-secondary);
  font-size: 12px;
  flex-wrap: wrap;
}

.oil-field-drawer__details-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.oil-field-drawer__details-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.oil-field-drawer__details-item:last-child {
  border-bottom: none;
}

.oil-field-drawer__details-item span,
.oil-field-drawer__details-item b {
  word-break: break-word;
}

:deep(.oil-field-page__drawer) {
  max-width: 100%;
}

:deep(.oil-field-page__drawer .el-drawer) {
  height: 100dvh !important;
  max-height: 100dvh !important;
  overflow: hidden;
}

:deep(.oil-field-page__drawer .el-drawer__body) {
  height: 100%;
  overflow-y: auto !important;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 1280px) {
  .oil-field-page__analytics-grid {
    grid-template-columns: 1fr;
  }

  .oil-field-page__filters-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 991px) {
  .oil-field-page__title {
    font-size: 24px;
  }

  .oil-field-page__pagination {
    justify-content: flex-start;
  }

  .oil-field-page__pagination :deep(.el-pagination) {
    justify-content: flex-start;
  }

  .oil-field-drawer__header {
    padding: 16px;
  }

  .oil-field-drawer__content {
    padding: 12px 16px 20px;
  }
}

@media (max-width: 768px) {
  .oil-field-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .oil-field-page__reset-button {
    width: 100%;
  }

  .oil-field-page__filters-grid {
    grid-template-columns: 1fr;
  }

  .oil-field-drawer__metrics {
    grid-template-columns: 1fr;
  }

  .oil-field-drawer__plan-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

@media (max-width: 575px) {
  .oil-field-page__title {
    font-size: 22px;
  }

  .oil-field-page__subtitle {
    font-size: 14px;
  }

  .oil-field-page__filters,
  .oil-field-page__table-card {
    border-radius: 14px;
  }

  .oil-field-page__table-meta {
    margin-bottom: 12px;
    font-size: 14px;
  }

  .oil-field-page__progress-cell {
    min-width: 100px;
  }

  .oil-field-drawer__header {
    padding: 12px;
  }

  .oil-field-drawer__content {
    padding: 12px 12px 20px;
    gap: 12px;
  }

  .oil-field-drawer__title {
    font-size: 22px;
  }

  .oil-field-drawer__subtitle {
    font-size: 13px;
  }

  .oil-field-drawer__close {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    font-size: 22px;
  }

  .oil-field-drawer__metric-card,
  .oil-field-drawer__plan-card,
  .oil-field-drawer__details-card {
    border-radius: 12px;
  }

  .oil-field-drawer__metric-value {
    font-size: 18px;
  }

  .oil-field-drawer__section-title {
    font-size: 14px;
  }

  .oil-field-drawer__details-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>

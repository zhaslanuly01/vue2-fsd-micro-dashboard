<template>
  <div class="well-page">
    <div class="well-page__header">
      <div>
        <h1 class="well-page__title">Скважины</h1>
        <p class="well-page__subtitle">Мониторинг фонда скважин и производственных показателей</p>
      </div>

      <el-button @click="handleResetFilters">Сбросить фильтры</el-button>
    </div>

    <WellKpi :loading="loading" />

    <div class="well-page__analytics-grid">
      <WellChart :loading="loading" />
      <WellMap :loading="loading" />
    </div>

    <el-card shadow="never" class="well-page__filters">
      <div class="well-page__filters-grid">
        <el-input
          :value="filters.search"
          placeholder="Поиск по номеру, названию, региону..."
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
      </div>
    </el-card>

    <el-card shadow="never" class="well-page__table-card">
      <div class="well-page__table-meta">
        <span>Найдено записей: {{ total }}</span>
      </div>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        class="well-page__alert"
      />

      <el-table
        v-loading="loading"
        :data="paginatedItems"
        border
        stripe
        class="well-page__table"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="wellNumber" label="№ Скважины" min-width="140" />
        <el-table-column prop="name" label="Название" min-width="160" />
        <el-table-column prop="fieldName" label="Месторождение" min-width="180" />
        <el-table-column prop="region" label="Регион" min-width="180" />

        <el-table-column prop="status" label="Статус" min-width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="plain">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="launchDate" label="Дата запуска" min-width="130" />
        <el-table-column prop="oilRate" label="Дебит нефти" min-width="130" sortable="custom" />
        <el-table-column prop="pressure" label="Давление" min-width="120" sortable="custom" />
        <el-table-column prop="depth" label="Глубина" min-width="120" sortable="custom" />

        <template #empty>
          <div class="well-page__empty">
            <span v-if="loading">Загрузка данных...</span>
            <span v-else>По текущим фильтрам ничего не найдено</span>
          </div>
        </template>
      </el-table>

      <div class="well-page__pagination">
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
      :size="drawerSize"
      direction="rtl"
      :with-header="false"
      :before-close="handleCloseDrawer"
      custom-class="well-page__drawer"
    >
      <div class="well-drawer">
        <div class="well-drawer__header">
          <div class="well-drawer__header-content">
            <h3 class="well-drawer__title">Детали скважины</h3>
            <p v-if="selectedWell" class="well-drawer__subtitle">
              {{ selectedWell.name }} · {{ selectedWell.wellNumber }}
            </p>
          </div>

          <button
            type="button"
            class="well-drawer__close"
            aria-label="Закрыть"
            @click="handleCloseDrawer"
          >
            ×
          </button>
        </div>

        <div v-if="selectedWell" class="well-details">
          <div class="well-details__section">
            <div class="well-details__item">
              <span class="well-details__label">ID</span><span>{{ selectedWell.id }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Номер</span
              ><span>{{ selectedWell.wellNumber }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Название</span><span>{{ selectedWell.name }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Месторождение</span
              ><span>{{ selectedWell.fieldName }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Регион</span><span>{{ selectedWell.region }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Статус</span
              ><span>{{ formatStatus(selectedWell.status) }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Дата запуска</span
              ><span>{{ selectedWell.launchDate }}</span>
            </div>
          </div>

          <div class="well-details__section">
            <div class="well-details__item">
              <span class="well-details__label">Дебит нефти</span
              ><span>{{ selectedWell.oilRate }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Дебит газа</span
              ><span>{{ selectedWell.gasRate }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Обводненность</span
              ><span>{{ selectedWell.waterCut }}%</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Глубина</span
              ><span>{{ selectedWell.depth }} м</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Давление</span
              ><span>{{ selectedWell.pressure }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Температура</span
              ><span>{{ selectedWell.temperature }} °C</span>
            </div>
          </div>

          <div class="well-details__section">
            <div class="well-details__item">
              <span class="well-details__label">Инженер</span
              ><span>{{ selectedWell.engineer }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Кластер</span
              ><span>{{ selectedWell.cluster }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Последняя инспекция</span
              ><span>{{ selectedWell.lastInspectionDate }}</span>
            </div>
            <div class="well-details__item">
              <span class="well-details__label">Координаты</span
              ><span>{{ selectedWell.lat }}, {{ selectedWell.lng }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { Well, WellStatus, WellsFilters } from '@/entities/well/model/well.types'
import { WellKpi } from '@/widgets/well/well-kpi'
import { WellChart } from '@/widgets/well/well-chart'
import { WellMap } from '@/widgets/well/well-map'

export default Vue.extend({
  name: 'WellPage',

  components: {
    WellKpi,
    WellChart,
    WellMap
  },

  data() {
    return {
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1440
    }
  },

  computed: {
    loading(): boolean {
      return this.$store.state.well.loading
    },

    error(): string | null {
      return this.$store.state.well.error
    },

    filters(): WellsFilters {
      return this.$store.state.well.filters
    },

    selectedWell(): Well | null {
      return this.$store.state.well.selectedWell
    },

    paginatedItems(): Well[] {
      return this.$store.getters['well/paginatedItems']
    },

    total(): number {
      return this.$store.getters['well/total']
    },

    statuses(): Array<{ label: string; value: string }> {
      return this.$store.getters['well/statuses']
    },

    regions(): string[] {
      return this.$store.getters['well/regions']
    },

    fieldNames(): string[] {
      return this.$store.getters['well/fieldNames']
    },

    highlightedWellId(): number | null {
      return this.$store.state.well.highlightedWellId
    },

    isDrawerVisible: {
      get(): boolean {
        return Boolean(this.selectedWell)
      },
      set(value: boolean) {
        if (!value) {
          this.$store.dispatch('well/closeDetails')
        }
      }
    },

    drawerSize(): string {
      if (this.windowWidth <= 575) return '100%'
      if (this.windowWidth <= 991) return '70%'
      return '420px'
    }
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
    },

    handleSearchInput(value: string) {
      this.$store.dispatch('well/updateFilters', { search: value })
    },

    handleStatusChange(value: string) {
      this.$store.dispatch('well/updateFilters', { status: value || '' })
    },

    handleRegionChange(value: string) {
      this.$store.dispatch('well/updateFilters', { region: value || '' })
    },

    handleFieldChange(value: string) {
      this.$store.dispatch('well/updateFilters', { fieldName: value || '' })
    },

    handlePageChange(page: number) {
      this.$store.dispatch('well/changePage', page)
    },

    handlePageSizeChange(pageSize: number) {
      this.$store.dispatch('well/changePageSize', pageSize)
    },

    handleResetFilters() {
      this.$store.dispatch('well/resetFilters')
    },

    handleRowClick(row: Well) {
      this.$store.dispatch('well/selectWell', row)
    },

    handleCloseDrawer() {
      this.$store.dispatch('well/closeDetails')
    },

    handleSortChange({
      prop,
      order
    }: {
      column: unknown
      prop: string
      order: '' | 'ascending' | 'descending'
    }) {
      this.$store.dispatch('well/changeSorting', {
        sortBy: prop || '',
        sortOrder: order || ''
      })
    },

    getRowClassName({ row }: { row: Well }) {
      return this.highlightedWellId === row.id ? 'well-table__row--highlighted' : ''
    },

    formatStatus(status: WellStatus) {
      const map: Record<WellStatus, string> = {
        active: 'Активна',
        inactive: 'Неактивна',
        maintenance: 'На обслуживании',
        conservation: 'Консервация'
      }

      return map[status]
    },

    getStatusTagType(status: WellStatus) {
      const map: Record<WellStatus, string> = {
        active: 'success',
        inactive: 'info',
        maintenance: 'warning',
        conservation: 'danger'
      }

      return map[status]
    }
  },

  mounted() {
    this.$store.dispatch('well/fetchWells')
    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  }
})
</script>
<style scoped>
.well-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.well-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.well-page__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--label-primary);
}

.well-page__subtitle {
  margin: 8px 0 0;
  color: var(--label-secondary);
}

.well-page__analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
}

.well-page__filters,
.well-page__table-card {
  border-radius: 16px;
}

.well-page__filters-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px;
}

.well-page__table-meta {
  margin-bottom: 16px;
  color: var(--label-secondary);
}

.well-page__alert {
  margin-bottom: 16px;
}

.well-page__table {
  width: 100%;
}

.well-page__table :deep(.well-table__row--highlighted > td) {
  background-color: #ecf5ff !important;
}

.well-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.well-page__empty {
  padding: 24px 0;
  color: var(--label-secondary);
}

.well-details {
  padding: 4px 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.well-details__section {
  border: 1px solid var(--neutral-gray-4);
  border-radius: 12px;
  padding: 12px;
}

.well-details__item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--neutral-gray-3);
}

.well-details__item:last-child {
  border-bottom: none;
}

.well-details__label {
  color: var(--label-secondary);
  flex-shrink: 0;
}

@media (max-width: 1200px) {
  .well-page__analytics-grid {
    grid-template-columns: 1fr;
  }

  .well-page__filters-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .well-page {
    padding: 12px;
    gap: 12px;
  }

  .well-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .well-page__title {
    font-size: 24px;
  }

  .well-page__subtitle {
    font-size: 14px;
  }

  .well-page__analytics-grid {
    gap: 12px;
  }

  .well-page__filters-grid {
    grid-template-columns: 1fr;
  }

  .well-page__pagination {
    overflow-x: auto;
    justify-content: flex-start;
  }
}

.well-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.well-drawer__header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--neutral-gray-4);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.well-drawer__header-content {
  min-width: 0;
}

.well-drawer__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--label-primary);
}

.well-drawer__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  word-break: break-word;
}

.well-drawer__close {
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

.well-details {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.well-details__section {
  border: 1px solid var(--neutral-gray-4);
  border-radius: 12px;
  padding: 12px;
}

.well-details__item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--neutral-gray-3);
}

.well-details__item:last-child {
  border-bottom: none;
}

.well-details__label {
  color: var(--label-secondary);
  flex-shrink: 0;
}

.well-details__item span:last-child {
  text-align: right;
  word-break: break-word;
}

:deep(.well-page__drawer) {
  max-width: 100%;
}

:deep(.well-page__drawer .el-drawer__body) {
  padding: 0;
  overflow: hidden;
}

@media (max-width: 991px) {
  .well-drawer__header {
    padding: 16px 16px 12px;
  }

  .well-details {
    padding: 12px 16px 16px;
  }
}

@media (max-width: 575px) {
  .well-drawer__title {
    font-size: 18px;
  }

  .well-drawer__subtitle {
    font-size: 13px;
  }

  .well-drawer__close {
    width: 36px;
    height: 36px;
    font-size: 22px;
    border-radius: 8px;
  }

  .well-details {
    padding: 12px;
    gap: 12px;
  }

  .well-details__section {
    padding: 10px;
    border-radius: 10px;
  }

  .well-details__item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .well-details__item span:last-child {
    text-align: left;
  }
}
</style>

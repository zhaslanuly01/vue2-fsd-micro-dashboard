<template>
  <div class="tank-page">
    <div class="tank-page__header">
      <div>
        <h1 class="tank-page__title">Резервуары хранения</h1>
        <p class="tank-page__subtitle">Контроль терминалов, объемов, заполненности и отгрузки</p>
      </div>

      <el-button @click="handleResetFilters">Сбросить фильтры</el-button>
    </div>

    <StorageTankKpi :loading="loading" />

    <div class="tank-page__overview-grid">
      <div class="tank-page__overview-main">
        <StorageTankMap :loading="loading" />
      </div>

      <div class="tank-page__overview-side">
        <StorageTankChart :loading="loading" />

        <el-card shadow="never" class="tank-page__summary-card">
          <div class="tank-page__summary-title">Операционный срез</div>

          <div v-if="loading" class="tank-page__summary-list">
            <div v-for="n in 5" :key="n" class="tank-page__summary-item">
              <div class="tank-page__skeleton tank-page__skeleton--label" />
              <div class="tank-page__skeleton tank-page__skeleton--value" />
            </div>
          </div>

          <div v-else class="tank-page__summary-list">
            <div class="tank-page__summary-item">
              <span>Высокая нагрузка</span>
              <b>{{ highLoadCount }}</b>
            </div>
            <div class="tank-page__summary-item">
              <span>На обслуживании</span>
              <b>{{ maintenanceCount }}</b>
            </div>
            <div class="tank-page__summary-item">
              <span>Суточный прием</span>
              <b>{{ formatNumber(totalDailyIntake) }}</b>
            </div>
            <div class="tank-page__summary-item">
              <span>Суточная отгрузка</span>
              <b>{{ formatNumber(totalDailyShipment) }}</b>
            </div>
            <div class="tank-page__summary-item">
              <span>Нетто-поток</span>
              <b :class="netFlowClass">{{ formatSignedNumber(netFlow) }}</b>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <el-card shadow="never" class="tank-page__filters">
      <div class="tank-page__filters-grid">
        <el-input
          :value="filters.search"
          placeholder="Поиск по номеру резервуара, терминалу, региону..."
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
          :value="filters.terminalName"
          placeholder="Терминал"
          clearable
          @change="handleTerminalChange"
        >
          <el-option
            v-for="terminal in terminalNames"
            :key="terminal"
            :label="terminal"
            :value="terminal"
          />
        </el-select>

        <el-select
          :value="filters.productType"
          placeholder="Тип продукта"
          clearable
          @change="handleProductTypeChange"
        >
          <el-option
            v-for="item in productTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </el-card>

    <el-card shadow="never" class="tank-page__table-card">
      <div class="tank-page__table-meta">
        <span>Найдено записей: {{ total }}</span>
      </div>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        class="tank-page__alert"
      />

      <el-table
        v-loading="loading"
        :data="paginatedItems"
        border
        stripe
        class="tank-page__table"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="tankNumber" label="№ Резервуара" min-width="140" />
        <el-table-column prop="terminalName" label="Терминал" min-width="210" />
        <el-table-column prop="region" label="Регион" min-width="180" />

        <el-table-column prop="status" label="Статус" min-width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="plain">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="productType" label="Продукт" min-width="140">
          <template #default="{ row }">
            {{ formatProductType(row.productType) }}
          </template>
        </el-table-column>

        <el-table-column prop="capacity" label="Вместимость" min-width="130" sortable="custom" />
        <el-table-column
          prop="currentVolume"
          label="Текущий объем"
          min-width="140"
          sortable="custom"
        />
        <el-table-column prop="fillPercent" label="Заполненность" min-width="150" sortable="custom">
          <template #default="{ row }">
            <div class="tank-page__fill-cell">
              <el-progress
                :percentage="Math.round(row.fillPercent)"
                :stroke-width="12"
                :status="getProgressStatus(row.fillPercent)"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="dailyIntake" label="Сут. прием" min-width="120" sortable="custom" />
        <el-table-column
          prop="dailyShipment"
          label="Сут. отгрузка"
          min-width="130"
          sortable="custom"
        />

        <template #empty>
          <div class="tank-page__empty">
            <span v-if="loading">Загрузка данных...</span>
            <span v-else>По текущим фильтрам ничего не найдено</span>
          </div>
        </template>
      </el-table>

      <div class="tank-page__pagination">
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
      <div v-if="selectedTank" class="tank-drawer">
        <div class="tank-drawer__hero">
          <div>
            <div class="tank-drawer__eyebrow">Резервуар</div>
            <div class="tank-drawer__title">{{ selectedTank.tankNumber }}</div>
            <div class="tank-drawer__subtitle">{{ selectedTank.terminalName }}</div>
          </div>

          <el-tag :type="getStatusTagType(selectedTank.status)" effect="dark">
            {{ formatStatus(selectedTank.status) }}
          </el-tag>
        </div>

        <el-card shadow="never" class="tank-drawer__progress-card">
          <div class="tank-drawer__section-title">Текущая загрузка</div>
          <div class="tank-drawer__progress-value">{{ selectedTank.fillPercent }}%</div>
          <el-progress
            :percentage="Math.round(selectedTank.fillPercent)"
            :stroke-width="16"
            :status="getProgressStatus(selectedTank.fillPercent)"
          />
          <div class="tank-drawer__progress-meta">
            <span>{{ formatNumber(selectedTank.currentVolume) }} текущий объем</span>
            <span>{{ formatNumber(selectedTank.capacity) }} вместимость</span>
          </div>
        </el-card>

        <div class="tank-drawer__metrics">
          <el-card shadow="never" class="tank-drawer__metric-card">
            <div class="tank-drawer__metric-label">Сут. прием</div>
            <div class="tank-drawer__metric-value">
              {{ formatNumber(selectedTank.dailyIntake) }}
            </div>
          </el-card>

          <el-card shadow="never" class="tank-drawer__metric-card">
            <div class="tank-drawer__metric-label">Сут. отгрузка</div>
            <div class="tank-drawer__metric-value">
              {{ formatNumber(selectedTank.dailyShipment) }}
            </div>
          </el-card>
        </div>

        <el-card shadow="never" class="tank-drawer__details-card">
          <div class="tank-drawer__section-title">Паспорт объекта</div>

          <div class="tank-drawer__details-list">
            <div class="tank-drawer__details-item">
              <span>Регион</span>
              <b>{{ selectedTank.region }}</b>
            </div>
            <div class="tank-drawer__details-item">
              <span>Тип продукта</span>
              <b>{{ formatProductType(selectedTank.productType) }}</b>
            </div>
            <div class="tank-drawer__details-item">
              <span>Дата ввода</span>
              <b>{{ selectedTank.commissioningDate }}</b>
            </div>
            <div class="tank-drawer__details-item">
              <span>Нетто-поток</span>
              <b :class="getNetFlowClass(selectedTank.dailyIntake - selectedTank.dailyShipment)">
                {{ formatSignedNumber(selectedTank.dailyIntake - selectedTank.dailyShipment) }}
              </b>
            </div>
            <div class="tank-drawer__details-item">
              <span>Координаты</span>
              <b>{{ selectedTank.lat }}, {{ selectedTank.lng }}</b>
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
  ProductType,
  StorageTank,
  StorageTankFilters,
  TankStatus
} from '@/entities/storage-tank/model/storage-tank.types'
import { StorageTankKpi } from '@/widgets/storage-tank/storage-tank-kpi'
import { StorageTankChart } from '@/widgets/storage-tank/storage-tank-chart'
import { StorageTankMap } from '@/widgets/storage-tank/storage-tank-map'

export default Vue.extend({
  name: 'StorageTankPage',

  components: {
    StorageTankKpi,
    StorageTankChart,
    StorageTankMap
  },

  computed: {
    loading(): boolean {
      return this.$store.state.storageTank.loading
    },

    error(): string | null {
      return this.$store.state.storageTank.error
    },

    filters(): StorageTankFilters {
      return this.$store.state.storageTank.filters
    },

    selectedTank(): StorageTank | null {
      return this.$store.state.storageTank.selectedTank
    },

    paginatedItems(): StorageTank[] {
      return this.$store.getters['storageTank/paginatedItems']
    },

    filteredItems(): StorageTank[] {
      return this.$store.getters['storageTank/filteredItems']
    },

    total(): number {
      return this.$store.getters['storageTank/total']
    },

    statuses(): Array<{ label: string; value: string }> {
      return this.$store.getters['storageTank/statuses']
    },

    regions(): string[] {
      return this.$store.getters['storageTank/regions']
    },

    terminalNames(): string[] {
      return this.$store.getters['storageTank/terminalNames']
    },

    productTypes(): Array<{ label: string; value: ProductType }> {
      return this.$store.getters['storageTank/productTypes']
    },

    highlightedTankId(): number | null {
      return this.$store.state.storageTank.highlightedTankId
    },

    highLoadCount(): number {
      return this.filteredItems.filter((item) => item.status === 'high_load').length
    },

    maintenanceCount(): number {
      return this.filteredItems.filter((item) => item.status === 'maintenance').length
    },

    totalDailyIntake(): number {
      return this.filteredItems.reduce((sum, item) => sum + item.dailyIntake, 0)
    },

    totalDailyShipment(): number {
      return this.filteredItems.reduce((sum, item) => sum + item.dailyShipment, 0)
    },

    netFlow(): number {
      return this.totalDailyIntake - this.totalDailyShipment
    },

    netFlowClass(): string {
      return this.netFlow >= 0 ? 'tank-page__number--positive' : 'tank-page__number--negative'
    },

    isDrawerVisible: {
      get(): boolean {
        return Boolean(this.selectedTank)
      },
      set(value: boolean) {
        if (!value) {
          this.$store.dispatch('storageTank/closeDetails')
        }
      }
    }
  },

  methods: {
    handleSearchInput(value: string) {
      this.$store.dispatch('storageTank/updateFilters', { search: value })
    },

    handleStatusChange(value: string) {
      this.$store.dispatch('storageTank/updateFilters', { status: value || '' })
    },

    handleRegionChange(value: string) {
      this.$store.dispatch('storageTank/updateFilters', { region: value || '' })
    },

    handleTerminalChange(value: string) {
      this.$store.dispatch('storageTank/updateFilters', { terminalName: value || '' })
    },

    handleProductTypeChange(value: string) {
      this.$store.dispatch('storageTank/updateFilters', { productType: value || '' })
    },

    handlePageChange(page: number) {
      this.$store.dispatch('storageTank/changePage', page)
    },

    handlePageSizeChange(pageSize: number) {
      this.$store.dispatch('storageTank/changePageSize', pageSize)
    },

    handleResetFilters() {
      this.$store.dispatch('storageTank/resetFilters')
    },

    handleRowClick(row: StorageTank) {
      this.$store.dispatch('storageTank/selectTank', row)
    },

    handleCloseDrawer() {
      this.$store.dispatch('storageTank/closeDetails')
    },

    handleSortChange({
      prop,
      order
    }: {
      column: unknown
      prop: string
      order: '' | 'ascending' | 'descending'
    }) {
      this.$store.dispatch('storageTank/changeSorting', {
        sortBy: prop || '',
        sortOrder: order || ''
      })
    },

    getRowClassName({ row }: { row: StorageTank }) {
      return this.highlightedTankId === row.id ? 'tank-table__row--highlighted' : ''
    },

    formatStatus(status: TankStatus) {
      const map: Record<TankStatus, string> = {
        normal: 'Нормальный',
        high_load: 'Высокая нагрузка',
        maintenance: 'На обслуживании',
        offline: 'Оффлайн'
      }

      return map[status]
    },

    formatProductType(type: ProductType) {
      const map: Record<ProductType, string> = {
        oil: 'Нефть',
        gas_condensate: 'Газоконденсат',
        fuel_oil: 'Мазут'
      }

      return map[type]
    },

    getStatusTagType(status: TankStatus) {
      const map: Record<TankStatus, string> = {
        normal: 'success',
        high_load: 'danger',
        maintenance: 'warning',
        offline: 'info'
      }

      return map[status]
    },

    getProgressStatus(fillPercent: number): '' | 'success' | 'warning' | 'exception' {
      if (fillPercent >= 85) return 'exception'
      if (fillPercent >= 70) return 'warning'
      return 'success'
    },

    formatNumber(value: number): string {
      return new Intl.NumberFormat('ru-RU').format(value)
    },

    formatSignedNumber(value: number): string {
      const formatted = new Intl.NumberFormat('ru-RU').format(Math.abs(value))
      return value >= 0 ? `+${formatted}` : `-${formatted}`
    },

    getNetFlowClass(value: number): string {
      return value >= 0 ? 'tank-page__number--positive' : 'tank-page__number--negative'
    }
  },

  mounted() {
    this.$store.dispatch('storageTank/fetchStorageTanks')
  }
})
</script>

<style scoped>
.tank-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tank-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.tank-page__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--label-primary);
}

.tank-page__subtitle {
  margin: 8px 0 0;
  color: var(--label-secondary);
}

.tank-page__overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(360px, 0.9fr);
  gap: 16px;
  align-items: stretch;
}

.tank-page__overview-main,
.tank-page__overview-side {
  min-width: 0;
}

.tank-page__overview-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tank-page__summary-card,
.tank-page__filters,
.tank-page__table-card {
  border-radius: 18px;
}

.tank-page__summary-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 14px;
}

.tank-page__summary-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tank-page__summary-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.tank-page__summary-item:last-child {
  border-bottom: none;
}

.tank-page__filters-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(160px, 1fr));
  gap: 12px;
}

.tank-page__table-meta {
  margin-bottom: 16px;
  color: var(--label-secondary);
}

.tank-page__alert {
  margin-bottom: 16px;
}

.tank-page__table {
  width: 100%;
}

.tank-page__table :deep(.tank-table__row--highlighted > td) {
  background-color: #ecf5ff !important;
}

.tank-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.tank-page__empty {
  padding: 24px 0;
  color: var(--label-secondary);
}

.tank-page__fill-cell {
  min-width: 120px;
}

.tank-drawer {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f7f8fa;
  min-height: 100%;
}

.tank-drawer__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.tank-drawer__eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--label-secondary);
  margin-bottom: 6px;
}

.tank-drawer__title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--label-primary);
}

.tank-drawer__subtitle {
  margin-top: 6px;
  color: var(--label-secondary);
}

.tank-drawer__progress-card,
.tank-drawer__metric-card,
.tank-drawer__details-card {
  border-radius: 16px;
}

.tank-drawer__section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.tank-drawer__progress-value {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 12px;
}

.tank-drawer__progress-meta {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--label-secondary);
  font-size: 12px;
}

.tank-drawer__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tank-drawer__metric-label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.tank-drawer__metric-value {
  font-size: 22px;
  font-weight: 700;
}

.tank-drawer__details-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tank-drawer__details-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.tank-drawer__details-item:last-child {
  border-bottom: none;
}

.tank-page__number--positive {
  color: #67c23a;
}

.tank-page__number--negative {
  color: #f56c6c;
}

@media (max-width: 1280px) {
  .tank-page__overview-grid {
    grid-template-columns: 1fr;
  }

  .tank-page__filters-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .tank-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .tank-page__filters-grid {
    grid-template-columns: 1fr;
  }

  .tank-drawer__metrics {
    grid-template-columns: 1fr;
  }
}

.tank-page__skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: tank-page-skeleton-loading 1.4s infinite;
}

.tank-page__skeleton--label {
  width: 120px;
  height: 16px;
}

.tank-page__skeleton--value {
  width: 70px;
  height: 18px;
}

@keyframes tank-page-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

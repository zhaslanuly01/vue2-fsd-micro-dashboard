<template>
  <div class="pipeline-page">
    <div class="pipeline-page__header">
      <div>
        <h1 class="pipeline-page__title">Участки трубопровода</h1>
        <p class="pipeline-page__subtitle">
          Контроль состояния сети, давления, пропускной способности и инцидентов
        </p>
      </div>

      <el-button @click="handleResetFilters">Сбросить фильтры</el-button>
    </div>

    <PipelineKpi :loading="loading" />

    <div class="pipeline-page__analytics-grid">
      <div class="pipeline-page__analytics-main">
        <PipelineMap :loading="loading" />
      </div>

      <div class="pipeline-page__analytics-side">
        <PipelineStatusChart :loading="loading" />
        <PipelineThroughputChart :loading="loading" />
      </div>
    </div>

    <el-card shadow="never" class="pipeline-page__filters">
      <div class="pipeline-page__filters-grid">
        <el-input
          :value="filters.search"
          placeholder="Поиск по названию участка или региону..."
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
      </div>
    </el-card>

    <el-card shadow="never" class="pipeline-page__table-card">
      <div class="pipeline-page__table-meta">
        <span>Найдено записей: {{ total }}</span>
      </div>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        class="pipeline-page__alert"
      />

      <el-table
        v-loading="loading"
        :data="paginatedItems"
        border
        stripe
        class="pipeline-page__table"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="sectionName" label="Участок" min-width="170" />
        <el-table-column prop="region" label="Регион" min-width="180" />

        <el-table-column prop="status" label="Статус" min-width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="plain">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="startDate" label="Дата ввода" min-width="130" />
        <el-table-column prop="lengthKm" label="Длина, км" min-width="120" sortable="custom" />
        <el-table-column
          prop="throughput"
          label="Пропускная способность"
          min-width="170"
          sortable="custom"
        />
        <el-table-column prop="pressure" label="Давление" min-width="120" sortable="custom" />
        <el-table-column prop="incidentsCount" label="Инциденты" min-width="120" sortable="custom">
          <template #default="{ row }">
            <el-badge
              :value="row.incidentsCount"
              :max="99"
              :type="getIncidentBadgeType(row.incidentsCount)"
            >
              <span class="pipeline-page__badge-label">Случаи</span>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column prop="lastInspectionDate" label="Последняя инспекция" min-width="160" />

        <template #empty>
          <div class="pipeline-page__empty">
            <span v-if="loading">Загрузка данных...</span>
            <span v-else>По текущим фильтрам ничего не найдено</span>
          </div>
        </template>
      </el-table>

      <div class="pipeline-page__pagination">
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
      <div v-if="selectedPipeline" class="pipeline-drawer">
        <div class="pipeline-drawer__hero">
          <div>
            <div class="pipeline-drawer__eyebrow">Участок трубопровода</div>
            <div class="pipeline-drawer__title">{{ selectedPipeline.sectionName }}</div>
            <div class="pipeline-drawer__subtitle">{{ selectedPipeline.region }}</div>
          </div>

          <el-tag :type="getStatusTagType(selectedPipeline.status)" effect="dark">
            {{ formatStatus(selectedPipeline.status) }}
          </el-tag>
        </div>

        <div class="pipeline-drawer__metrics">
          <el-card shadow="never" class="pipeline-drawer__metric-card">
            <div class="pipeline-drawer__metric-label">Длина</div>
            <div class="pipeline-drawer__metric-value">{{ selectedPipeline.lengthKm }} км</div>
          </el-card>

          <el-card shadow="never" class="pipeline-drawer__metric-card">
            <div class="pipeline-drawer__metric-label">Давление</div>
            <div class="pipeline-drawer__metric-value">{{ selectedPipeline.pressure }}</div>
          </el-card>

          <el-card shadow="never" class="pipeline-drawer__metric-card">
            <div class="pipeline-drawer__metric-label">Пропускная способность</div>
            <div class="pipeline-drawer__metric-value">
              {{ formatNumber(selectedPipeline.throughput) }}
            </div>
          </el-card>

          <el-card shadow="never" class="pipeline-drawer__metric-card">
            <div class="pipeline-drawer__metric-label">Инциденты</div>
            <div class="pipeline-drawer__metric-value">
              {{ selectedPipeline.incidentsCount }}
            </div>
          </el-card>
        </div>

        <el-card shadow="never" class="pipeline-drawer__risk-card">
          <div class="pipeline-drawer__section-title">Риск-профиль</div>

          <div class="pipeline-drawer__risk-list">
            <div class="pipeline-drawer__risk-item">
              <span>Давление</span>
              <b :class="getPressureClass(selectedPipeline.pressure)">
                {{ selectedPipeline.pressure }}
              </b>
            </div>
            <div class="pipeline-drawer__risk-item">
              <span>Инциденты</span>
              <b :class="getIncidentClass(selectedPipeline.incidentsCount)">
                {{ selectedPipeline.incidentsCount }}
              </b>
            </div>
            <div class="pipeline-drawer__risk-item">
              <span>Последняя инспекция</span>
              <b>{{ selectedPipeline.lastInspectionDate }}</b>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="pipeline-drawer__details-card">
          <div class="pipeline-drawer__section-title">Паспорт участка</div>

          <div class="pipeline-drawer__details-list">
            <div class="pipeline-drawer__details-item">
              <span>ID</span>
              <b>{{ selectedPipeline.id }}</b>
            </div>
            <div class="pipeline-drawer__details-item">
              <span>Название</span>
              <b>{{ selectedPipeline.sectionName }}</b>
            </div>
            <div class="pipeline-drawer__details-item">
              <span>Регион</span>
              <b>{{ selectedPipeline.region }}</b>
            </div>
            <div class="pipeline-drawer__details-item">
              <span>Дата запуска</span>
              <b>{{ selectedPipeline.startDate }}</b>
            </div>
            <div class="pipeline-drawer__details-item">
              <span>Последняя инспекция</span>
              <b>{{ selectedPipeline.lastInspectionDate }}</b>
            </div>
            <div class="pipeline-drawer__details-item">
              <span>Координаты</span>
              <b>{{ selectedPipeline.lat }}, {{ selectedPipeline.lng }}</b>
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
  PipelineFilters,
  PipelineSection,
  PipelineStatus
} from '@/entities/pipeline/model/pipeline.types'
import { PipelineKpi } from '@/widgets/pipeline/pipeline-kpi'
import { PipelineMap } from '@/widgets/pipeline/pipeline-map'
import { PipelineStatusChart } from '@/widgets/pipeline/pipeline-status-chart'
import { PipelineThroughputChart } from '@/widgets/pipeline/pipeline-throughput-chart'

export default Vue.extend({
  name: 'PipelinePage',

  components: {
    PipelineKpi,
    PipelineMap,
    PipelineStatusChart,
    PipelineThroughputChart
  },

  computed: {
    loading(): boolean {
      return this.$store.state.pipeline.loading
    },

    error(): string | null {
      return this.$store.state.pipeline.error
    },

    filters(): PipelineFilters {
      return this.$store.state.pipeline.filters
    },

    selectedPipeline(): PipelineSection | null {
      return this.$store.state.pipeline.selectedPipeline
    },

    paginatedItems(): PipelineSection[] {
      return this.$store.getters['pipeline/paginatedItems']
    },

    total(): number {
      return this.$store.getters['pipeline/total']
    },

    statuses(): Array<{ label: string; value: string }> {
      return this.$store.getters['pipeline/statuses']
    },

    regions(): string[] {
      return this.$store.getters['pipeline/regions']
    },

    highlightedPipelineId(): number | null {
      return this.$store.state.pipeline.highlightedPipelineId
    },

    isDrawerVisible: {
      get(): boolean {
        return Boolean(this.selectedPipeline)
      },
      set(value: boolean) {
        if (!value) {
          this.$store.dispatch('pipeline/closeDetails')
        }
      }
    }
  },

  methods: {
    handleSearchInput(value: string) {
      this.$store.dispatch('pipeline/updateFilters', { search: value })
    },

    handleStatusChange(value: string) {
      this.$store.dispatch('pipeline/updateFilters', { status: value || '' })
    },

    handleRegionChange(value: string) {
      this.$store.dispatch('pipeline/updateFilters', { region: value || '' })
    },

    handlePageChange(page: number) {
      this.$store.dispatch('pipeline/changePage', page)
    },

    handlePageSizeChange(pageSize: number) {
      this.$store.dispatch('pipeline/changePageSize', pageSize)
    },

    handleResetFilters() {
      this.$store.dispatch('pipeline/resetFilters')
    },

    handleRowClick(row: PipelineSection) {
      this.$store.dispatch('pipeline/selectPipeline', row)
    },

    handleCloseDrawer() {
      this.$store.dispatch('pipeline/closeDetails')
    },

    handleSortChange({
      prop,
      order
    }: {
      column: unknown
      prop: string
      order: '' | 'ascending' | 'descending'
    }) {
      this.$store.dispatch('pipeline/changeSorting', {
        sortBy: prop || '',
        sortOrder: order || ''
      })
    },

    getRowClassName({ row }: { row: PipelineSection }) {
      return this.highlightedPipelineId === row.id ? 'pipeline-table__row--highlighted' : ''
    },

    formatStatus(status: PipelineStatus) {
      const map: Record<PipelineStatus, string> = {
        operational: 'Работает',
        inspection: 'Инспекция',
        repair: 'Ремонт',
        critical: 'Аварийный'
      }

      return map[status]
    },

    getStatusTagType(status: PipelineStatus) {
      const map: Record<PipelineStatus, string> = {
        operational: 'success',
        inspection: '',
        repair: 'warning',
        critical: 'danger'
      }

      return map[status]
    },

    getIncidentBadgeType(count: number): 'primary' | 'success' | 'warning' | 'danger' {
      if (count >= 5) return 'danger'
      if (count >= 2) return 'warning'
      return 'success'
    },

    getPressureClass(value: number): string {
      if (value >= 100) return 'pipeline-page__number--negative'
      if (value >= 80) return 'pipeline-page__number--warning'
      return 'pipeline-page__number--positive'
    },

    getIncidentClass(value: number): string {
      if (value >= 5) return 'pipeline-page__number--negative'
      if (value >= 2) return 'pipeline-page__number--warning'
      return 'pipeline-page__number--positive'
    },

    formatNumber(value: number): string {
      return new Intl.NumberFormat('ru-RU').format(value)
    }
  },

  mounted() {
    this.$store.dispatch('pipeline/fetchPipelineSections')
  }
})
</script>

<style scoped>
.pipeline-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pipeline-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.pipeline-page__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--label-primary);
}

.pipeline-page__subtitle {
  margin: 8px 0 0;
  color: var(--label-secondary);
}

.pipeline-page__analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(340px, 0.9fr);
  gap: 16px;
  align-items: stretch;
}

.pipeline-page__analytics-main,
.pipeline-page__analytics-side {
  min-width: 0;
}

.pipeline-page__analytics-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pipeline-page__filters,
.pipeline-page__table-card {
  border-radius: 18px;
}

.pipeline-page__filters-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
}

.pipeline-page__table-meta {
  margin-bottom: 16px;
  color: var(--label-secondary);
}

.pipeline-page__alert {
  margin-bottom: 16px;
}

.pipeline-page__table {
  width: 100%;
}

.pipeline-page__table :deep(.pipeline-table__row--highlighted > td) {
  background-color: #ecf5ff !important;
}

.pipeline-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.pipeline-page__empty {
  padding: 24px 0;
  color: var(--label-secondary);
}

.pipeline-page__badge-label {
  color: var(--label-secondary);
}

.pipeline-drawer {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f7f8fa;
  min-height: 100%;
}

.pipeline-drawer__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.pipeline-drawer__eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--label-secondary);
  margin-bottom: 6px;
}

.pipeline-drawer__title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--label-primary);
}

.pipeline-drawer__subtitle {
  margin-top: 6px;
  color: var(--label-secondary);
}

.pipeline-drawer__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pipeline-drawer__metric-card,
.pipeline-drawer__risk-card,
.pipeline-drawer__details-card {
  border-radius: 16px;
}

.pipeline-drawer__metric-label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.pipeline-drawer__metric-value {
  font-size: 22px;
  font-weight: 700;
}

.pipeline-drawer__section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.pipeline-drawer__risk-list,
.pipeline-drawer__details-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pipeline-drawer__risk-item,
.pipeline-drawer__details-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.pipeline-drawer__risk-item:last-child,
.pipeline-drawer__details-item:last-child {
  border-bottom: none;
}

.pipeline-page__number--positive {
  color: #67c23a;
}

.pipeline-page__number--warning {
  color: #e6a23c;
}

.pipeline-page__number--negative {
  color: #f56c6c;
}

@media (max-width: 1280px) {
  .pipeline-page__analytics-grid {
    grid-template-columns: 1fr;
  }

  .pipeline-page__filters-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .pipeline-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .pipeline-page__filters-grid {
    grid-template-columns: 1fr;
  }

  .pipeline-drawer__metrics {
    grid-template-columns: 1fr;
  }
}
</style>

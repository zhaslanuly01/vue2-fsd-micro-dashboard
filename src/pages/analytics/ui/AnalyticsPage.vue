<template>
  <div class="analytics-page">
    <div class="analytics-page__header">
      <h1>Аналитика</h1>
      <p>Сводные показатели по всем сущностям</p>
    </div>

    <div class="analytics-page__grid">
      <ChartCard title="Скважины (статусы)">
        <canvas ref="wellsChart"></canvas>
      </ChartCard>

      <ChartCard title="Оборудование">
        <canvas ref="equipmentChart"></canvas>
      </ChartCard>

      <ChartCard title="Заявки (по датам)">
        <canvas ref="requestsChart"></canvas>
      </ChartCard>

      <ChartCard title="Резервуары">
        <canvas ref="tanksChart"></canvas>
      </ChartCard>

      <ChartCard title="Экология">
        <canvas ref="ecoChart"></canvas>
      </ChartCard>

      <ChartCard title="Pipeline">
        <canvas ref="pipelineChart"></canvas>
      </ChartCard>

      <ChartCard title="Добыча по месторождениям">
        <canvas ref="fieldsChart"></canvas>
      </ChartCard>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'

import wells from '@/shared/lib/server/__mocks__/well.json'
import equipment from '@/shared/lib/server/__mocks__/equipment.json'
import requests from '@/shared/lib/server/__mocks__/maintenance-requests.json'
import tanks from '@/shared/lib/server/__mocks__/storage-tanks.json'
import eco from '@/shared/lib/server/__mocks__/eco-station.json'
import pipelines from '@/shared/lib/server/__mocks__/pipeline-sections.json'
import fields from '@/shared/lib/server/__mocks__/oil-fields.json'
import { WellStatus } from '@/entities/well'
import { ChartCard } from '@/widgets/chart-card'
import {
  ECO_STATUS_LABELS,
  EQUIPMENT_STATUS_LABELS,
  PIPELINE_STATUS_LABELS,
  TANK_STATUS_LABELS,
  WELL_STATUS_LABELS
} from '../model/status.mapper'

export default Vue.extend({
  name: 'AnalyticsPage',
  components: { ChartCard },

  data() {
    return {
      charts: [] as Chart[]
    }
  },

  mounted() {
    this.initCharts()
  },

  beforeDestroy() {
    this.charts.forEach((c) => c.destroy())
  },

  methods: {
    createChart(el: HTMLCanvasElement, config: any) {
      const chart = new Chart(el, config)
      this.charts.push(chart)
    },

    initCharts() {
      this.initWellsChart()
      this.initEquipmentChart()
      this.initRequestsChart()
      this.initTanksChart()
      this.initEcoChart()
      this.initPipelineChart()
      this.initFieldsChart()
    },

    // 1. Wells (pie)
    initWellsChart() {
      const counts: Record<WellStatus, number> = {
        active: 0,
        inactive: 0,
        maintenance: 0,
        conservation: 0
      }

      wells.forEach((w) => {
        counts[w.status as WellStatus] += 1
      })

      const keys = Object.keys(counts) as WellStatus[]

      this.createChart(this.$refs.wellsChart as HTMLCanvasElement, {
        type: 'pie',
        data: {
          labels: keys.map((key) => WELL_STATUS_LABELS[key]),
          datasets: [
            {
              data: keys.map((key) => counts[key]),
              backgroundColor: ['#67C23A', '#909399', '#E6A23C', '#F56C6C']
            }
          ]
        }
      })
    },

    // 2. Equipment (bar)
    initEquipmentChart() {
      const counts: Record<string, number> = {}

      equipment.forEach((e) => {
        counts[e.status] = (counts[e.status] || 0) + 1
      })

      const keys = Object.keys(counts)

      this.createChart(this.$refs.equipmentChart as HTMLCanvasElement, {
        type: 'bar',
        data: {
          labels: keys.map(
            (key) => EQUIPMENT_STATUS_LABELS[key as keyof typeof EQUIPMENT_STATUS_LABELS] ?? key
          ),
          datasets: [
            {
              label: 'Количество оборудования',
              data: keys.map((key) => counts[key]),
              backgroundColor: '#409EFF'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: true
          }
        }
      })
    },
    // 3. Requests (line)
    initRequestsChart() {
      const byDate: Record<string, number> = {}

      requests.forEach((r) => {
        const date = r.createdAt.split('T')[0]
        byDate[date] = (byDate[date] || 0) + 1
      })

      const keys = Object.keys(byDate)

      this.createChart(this.$refs.requestsChart as HTMLCanvasElement, {
        type: 'line',
        data: {
          labels: keys,
          datasets: [
            {
              label: 'Количество заявок',
              data: keys.map((key) => byDate[key]),
              borderColor: '#67C23A',
              backgroundColor: 'transparent',
              fill: false
            }
          ]
        }
      })
    },

    // 4. Tanks (pie)
    initTanksChart() {
      const counts: Record<string, number> = {}

      tanks.forEach((t) => {
        counts[t.status] = (counts[t.status] || 0) + 1
      })

      const keys = Object.keys(counts)

      this.createChart(this.$refs.tanksChart as HTMLCanvasElement, {
        type: 'pie',
        data: {
          labels: keys.map(
            (key) => TANK_STATUS_LABELS[key as keyof typeof TANK_STATUS_LABELS] ?? key
          ),
          datasets: [
            {
              data: keys.map((key) => counts[key]),
              backgroundColor: ['#409EFF', '#E6A23C', '#F56C6C', '#D3D3D3']
            }
          ]
        }
      })
    },

    // 5. Eco (bar)
    initEcoChart() {
      const counts: Record<string, number> = {}

      eco.forEach((e) => {
        counts[e.status] = (counts[e.status] || 0) + 1
      })

      const keys = Object.keys(counts)

      this.createChart(this.$refs.ecoChart as HTMLCanvasElement, {
        type: 'bar',
        data: {
          labels: keys.map(
            (key) => ECO_STATUS_LABELS[key as keyof typeof ECO_STATUS_LABELS] ?? key
          ),
          datasets: [
            {
              label: 'Количество станций',
              data: keys.map((key) => counts[key]),
              backgroundColor: '#F56C6C'
            }
          ]
        }
      })
    },

    // 6. Pipeline (bar)
    initPipelineChart() {
      const counts: Record<string, number> = {}

      pipelines.forEach((p) => {
        counts[p.status] = (counts[p.status] || 0) + 1
      })

      const keys = Object.keys(counts)

      this.createChart(this.$refs.pipelineChart as HTMLCanvasElement, {
        type: 'bar',
        data: {
          labels: keys.map(
            (key) => PIPELINE_STATUS_LABELS[key as keyof typeof PIPELINE_STATUS_LABELS] ?? key
          ),
          datasets: [
            {
              label: 'Количество участков',
              data: keys.map((key) => counts[key]),
              backgroundColor: '#909399'
            }
          ]
        }
      })
    },

    // 7. Fields (line)
    initFieldsChart() {
      const byField: Record<string, number> = {}

      fields.forEach((f) => {
        byField[f.name] = f.monthlyProduction
      })

      const keys = Object.keys(byField)

      this.createChart(this.$refs.fieldsChart as HTMLCanvasElement, {
        type: 'line',
        data: {
          labels: keys,
          datasets: [
            {
              label: 'Месячная добыча',
              data: keys.map((key) => byField[key]),
              borderColor: '#409EFF',
              backgroundColor: 'transparent',
              fill: false
            }
          ]
        }
      })
    }
  }
})
</script>

<style scoped>
.analytics-page {
  padding: 0;
}

.analytics-page__header {
  margin-bottom: 12px;
}

.analytics-page__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-card {
  border-radius: 16px;
}

.chart-body {
  height: 280px;
}

@media (max-width: 1200px) {
  .analytics-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>

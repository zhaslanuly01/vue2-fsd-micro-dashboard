<template>
  <div class="analytics-page">
    <div class="analytics-page__header">
      <h1>Аналитика</h1>
      <p>Сводные показатели по всем сущностям</p>
    </div>

    <div v-if="isLoading" class="analytics-page__grid">
      <div v-for="n in 7" :key="n" class="chart-skeleton">
        <div class="chart-skeleton__title" />
        <div class="chart-skeleton__body" />
      </div>
    </div>

    <div v-else class="analytics-page__grid">
      <ChartCard title="Скважины (статусы)">
        <div class="analytics-page__chart-box analytics-page__chart-box--pie">
          <canvas ref="wellsChart"></canvas>
        </div>
      </ChartCard>

      <ChartCard title="Оборудование">
        <div class="analytics-page__chart-box">
          <canvas ref="equipmentChart"></canvas>
        </div>
      </ChartCard>

      <ChartCard title="Заявки (по датам)">
        <div class="analytics-page__chart-box">
          <canvas ref="requestsChart"></canvas>
        </div>
      </ChartCard>

      <ChartCard title="Резервуары">
        <div class="analytics-page__chart-box analytics-page__chart-box--pie">
          <canvas ref="tanksChart"></canvas>
        </div>
      </ChartCard>

      <ChartCard title="Экология">
        <div class="analytics-page__chart-box">
          <canvas ref="ecoChart"></canvas>
        </div>
      </ChartCard>

      <ChartCard title="Pipeline">
        <div class="analytics-page__chart-box">
          <canvas ref="pipelineChart"></canvas>
        </div>
      </ChartCard>

      <ChartCard title="Добыча по месторождениям">
        <div class="analytics-page__chart-box">
          <canvas ref="fieldsChart"></canvas>
        </div>
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
      charts: [] as Chart[],
      isLoading: true,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1440
    }
  },

  computed: {
    isMobile(): boolean {
      return this.windowWidth <= 767
    },

    isTablet(): boolean {
      return this.windowWidth <= 1200
    }
  },

  mounted() {
    this.loadAnalytics()
    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    this.charts.forEach((c) => c.destroy())
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth

      clearTimeout((this as any)._resizeTimer)
      ;(this as any)._resizeTimer = setTimeout(() => {
        if (!this.isLoading) {
          this.initCharts()
        }
      }, 150)
    },

    createChart(el: HTMLCanvasElement, config: any) {
      const chart = new Chart(el, config)
      this.charts.push(chart)
    },

    loadAnalytics() {
      this.isLoading = true

      setTimeout(() => {
        this.isLoading = false

        this.$nextTick(() => {
          this.initCharts()
        })
      }, 1200)
    },

    initCharts() {
      this.charts.forEach((c) => c.destroy())
      this.charts = []

      this.initWellsChart()
      this.initEquipmentChart()
      this.initRequestsChart()
      this.initTanksChart()
      this.initEcoChart()
      this.initPipelineChart()
      this.initFieldsChart()
    },

    getCommonChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 8,
            right: this.isMobile ? 4 : 8,
            bottom: 4,
            left: this.isMobile ? 4 : 8
          }
        }
      }
    },
    getBarChartOptions(values: number[]) {
      return {
        ...this.getCommonChartOptions(),
        legend: {
          display: false
        },
        tooltips: {
          mode: 'index',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [
            {
              ticks: {
                autoSkip: false,
                maxRotation: this.isMobile ? 0 : 20,
                minRotation: 0,
                fontSize: this.isMobile ? 10 : 12
              },
              gridLines: {
                display: false
              },
              categoryPercentage: 0.7,
              barPercentage: 0.8
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                min: 0,
                max: this.getPaddedMax(values, 0.2),
                fontSize: this.isMobile ? 10 : 12,
                maxTicksLimit: this.isMobile ? 5 : 7,
                callback: (value: number) => this.formatCompactNumber(value)
              }
            }
          ]
        }
      }
    },
    getRequestsLineOptions(values: number[]) {
      const max = this.getMaxValue(values)
      const upperBound = Math.max(3, max + 1)

      return {
        ...this.getCommonChartOptions(),
        legend: {
          display: false
        },
        tooltips: {
          mode: 'index',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [
            {
              ticks: {
                autoSkip: true,
                maxTicksLimit: this.isMobile ? 4 : 8,
                maxRotation: this.isMobile ? 0 : 30,
                minRotation: 0,
                fontSize: this.isMobile ? 10 : 12
              },
              gridLines: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: false,
                min: 0,
                max: upperBound,
                stepSize: 1,
                fontSize: this.isMobile ? 10 : 12,
                callback: (value: number) => String(value)
              }
            }
          ]
        }
      }
    },
    getLargeLineChartOptions(values: number[]) {
      return {
        ...this.getCommonChartOptions(),
        legend: {
          display: false
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (tooltipItem: { yLabel: number }) => {
              return ` ${tooltipItem.yLabel.toLocaleString('ru-RU')}`
            }
          }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [
            {
              ticks: {
                autoSkip: true,
                maxTicksLimit: this.isMobile ? 5 : 7,
                maxRotation: this.isMobile ? 0 : 28,
                minRotation: 0,
                fontSize: this.isMobile ? 10 : 12
              },
              gridLines: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                min: 0,
                max: this.getPaddedMax(values, 0.15),
                fontSize: this.isMobile ? 10 : 12,
                maxTicksLimit: this.isMobile ? 5 : 6,
                callback: (value: number) => this.formatCompactNumber(value)
              }
            }
          ]
        }
      }
    },
    getCartesianOptions() {
      return {
        ...this.getCommonChartOptions(),
        legend: {
          display: false
        },
        tooltips: {
          mode: 'index',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [
            {
              ticks: {
                autoSkip: true,
                maxTicksLimit: this.isMobile ? 4 : 8,
                maxRotation: this.isMobile ? 0 : 30,
                minRotation: 0,
                fontSize: this.isMobile ? 10 : 12
              },
              gridLines: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                fontSize: this.isMobile ? 10 : 12,
                maxTicksLimit: this.isMobile ? 5 : 7
              }
            }
          ]
        }
      }
    },
    getPieOptions() {
      return {
        ...this.getCommonChartOptions(),
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: this.isMobile ? 10 : 12,
            fontSize: this.isMobile ? 10 : 12,
            padding: this.isMobile ? 8 : 12
          }
        }
      }
    },

    formatDateLabel(date: string) {
      if (!this.isMobile) return date
      return date.slice(5) // MM-DD
    },

    formatFieldLabel(label: string) {
      if (!this.isMobile) return label
      return label.length > 10 ? `${label.slice(0, 10)}...` : label
    },

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
        },
        options: this.getPieOptions()
      })
    },

    initEquipmentChart() {
      const counts: Record<string, number> = {}

      equipment.forEach((e) => {
        counts[e.status] = (counts[e.status] || 0) + 1
      })

      const keys = Object.keys(counts)
      const values = keys.map((key) => counts[key])

      this.createChart(this.$refs.equipmentChart as HTMLCanvasElement, {
        type: 'bar',
        data: {
          labels: keys.map(
            (key) => EQUIPMENT_STATUS_LABELS[key as keyof typeof EQUIPMENT_STATUS_LABELS] ?? key
          ),
          datasets: [
            {
              label: 'Количество',
              data: values,
              backgroundColor: '#409EFF'
            }
          ]
        },
        options: this.getBarChartOptions(values)
      })
    },

    initRequestsChart() {
      const byDate: Record<string, number> = {}

      requests.forEach((r) => {
        const date = r.createdAt.split('T')[0]
        byDate[date] = (byDate[date] || 0) + 1
      })

      const keys = Object.keys(byDate).sort()
      const values = keys.map((key) => byDate[key])

      this.createChart(this.$refs.requestsChart as HTMLCanvasElement, {
        type: 'line',
        data: {
          labels: keys.map((key) => this.formatDateLabel(key)),
          datasets: [
            {
              label: 'Количество',
              data: values,
              borderColor: '#67C23A',
              backgroundColor: 'transparent',
              fill: false,
              lineTension: 0.25,
              pointRadius: this.isMobile ? 2 : 3,
              pointHoverRadius: this.isMobile ? 4 : 5,
              borderWidth: 3
            }
          ]
        },
        options: this.getRequestsLineOptions(values)
      })
    },

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
        },
        options: this.getPieOptions()
      })
    },

    initEcoChart() {
      const counts: Record<string, number> = {}

      eco.forEach((e) => {
        counts[e.status] = (counts[e.status] || 0) + 1
      })

      const keys = Object.keys(counts)
      const values = keys.map((key) => counts[key])

      this.createChart(this.$refs.ecoChart as HTMLCanvasElement, {
        type: 'bar',
        data: {
          labels: keys.map(
            (key) => ECO_STATUS_LABELS[key as keyof typeof ECO_STATUS_LABELS] ?? key
          ),
          datasets: [
            {
              label: 'Количество',
              data: values,
              backgroundColor: '#F56C6C'
            }
          ]
        },
        options: this.getBarChartOptions(values)
      })
    },

    initPipelineChart() {
      const counts: Record<string, number> = {}

      pipelines.forEach((p) => {
        counts[p.status] = (counts[p.status] || 0) + 1
      })

      const keys = Object.keys(counts)
      const values = keys.map((key) => counts[key])

      this.createChart(this.$refs.pipelineChart as HTMLCanvasElement, {
        type: 'bar',
        data: {
          labels: keys.map(
            (key) => PIPELINE_STATUS_LABELS[key as keyof typeof PIPELINE_STATUS_LABELS] ?? key
          ),
          datasets: [
            {
              label: 'Количество',
              data: values,
              backgroundColor: '#909399'
            }
          ]
        },
        options: this.getBarChartOptions(values)
      })
    },

    initFieldsChart() {
      const byField: Record<string, number> = {}

      fields.forEach((f) => {
        byField[f.name] = f.monthlyProduction
      })

      const keys = Object.keys(byField)
      const values = keys.map((key) => byField[key])

      this.createChart(this.$refs.fieldsChart as HTMLCanvasElement, {
        type: 'line',
        data: {
          labels: keys.map((key) => this.formatFieldLabel(key)),
          datasets: [
            {
              label: 'Добыча',
              data: values,
              borderColor: '#409EFF',
              backgroundColor: 'transparent',
              fill: false,
              lineTension: 0.25,
              pointRadius: this.isMobile ? 2 : 3,
              pointHoverRadius: this.isMobile ? 4 : 5,
              borderWidth: 3
            }
          ]
        },
        options: this.getLargeLineChartOptions(values)
      })
    },
    formatCompactNumber(value: number): string {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`
      }

      if (value >= 1000) {
        return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`
      }

      return String(value)
    },

    getMaxValue(values: number[]): number {
      if (!values.length) return 0
      return Math.max(...values)
    },

    getPaddedMax(values: number[], ratio = 0.15): number {
      const max = this.getMaxValue(values)
      if (max === 0) return 1

      const padded = max + max * ratio

      if (max <= 5) {
        return Math.ceil(padded)
      }

      if (max <= 100) {
        return Math.ceil(padded / 5) * 5
      }

      if (max <= 1000) {
        return Math.ceil(padded / 50) * 50
      }

      if (max <= 10000) {
        return Math.ceil(padded / 500) * 500
      }

      if (max <= 100000) {
        return Math.ceil(padded / 5000) * 5000
      }

      return Math.ceil(padded / 50000) * 50000
    }
  }
})
</script>

<style scoped>
.analytics-page {
  padding: 0;
  min-width: 0;
}

.analytics-page__header {
  margin-bottom: 12px;
}

.analytics-page__header h1 {
  margin: 0 0 4px;
  font-size: 28px;
  line-height: 1.2;
}

.analytics-page__header p {
  margin: 0;
  color: #606266;
}

.analytics-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.analytics-page__chart-box {
  position: relative;
  height: 280px;
  min-width: 0;
}

.analytics-page__chart-box--pie {
  height: 320px;
}

.chart-skeleton {
  padding: 20px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  min-width: 0;
}

.chart-skeleton__title {
  width: 180px;
  height: 18px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.4s infinite;
}

.chart-skeleton__body {
  width: 100%;
  height: 280px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.4s infinite;
}

@media (max-width: 1200px) {
  .analytics-page__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .analytics-page__header h1 {
    font-size: 22px;
  }

  .analytics-page__header p {
    font-size: 14px;
  }

  .analytics-page__grid {
    gap: 12px;
  }

  .analytics-page__chart-box {
    height: 220px;
  }

  .analytics-page__chart-box--pie {
    height: 260px;
  }

  .chart-skeleton {
    padding: 16px;
  }

  .chart-skeleton__body {
    height: 220px;
  }
}

@media (max-width: 575px) {
  .analytics-page__chart-box {
    height: 200px;
  }

  .analytics-page__chart-box--pie {
    height: 240px;
  }

  .chart-skeleton {
    padding: 12px;
    border-radius: 12px;
  }

  .chart-skeleton__title {
    width: 140px;
    height: 16px;
    margin-bottom: 12px;
  }

  .chart-skeleton__body {
    height: 200px;
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

<template>
  <el-card shadow="never" class="oil-field-production-chart">
    <div class="oil-field-production-chart__header">
      <div>
        <h3 class="oil-field-production-chart__title">Лидеры по суточной добыче</h3>
        <p class="oil-field-production-chart__subtitle">
          Клик по столбцу открывает карточку месторождения
        </p>
      </div>
    </div>

    <div v-if="loading" class="oil-field-production-chart__skeleton" />
    <div v-else class="oil-field-production-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { OilField } from '@/entities/oil-field/model/oil-field.types'

export default Vue.extend({
  name: 'OilFieldProductionChart',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      chart: null as Chart | null
    }
  },

  computed: {
    topProductionFields(): OilField[] {
      return this.$store.getters['oilField/topProductionFields']
    }
  },

  mounted() {
    if (!this.loading) {
      this.$nextTick(() => {
        this.renderChart()
      })
    }
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  },

  watch: {
    loading(value: boolean) {
      if (value) {
        if (this.chart) {
          this.chart.destroy()
          this.chart = null
        }
        return
      }

      this.$nextTick(() => {
        this.renderChart()
      })
    },

    topProductionFields: {
      handler() {
        if (this.loading) return
        this.$nextTick(() => {
          this.renderChart()
        })
      },
      deep: true
    }
  },

  methods: {
    getBarColor(status: OilField['status']): string {
      if (status === 'growing') return '#409EFF'
      if (status === 'stable') return '#67C23A'
      if (status === 'declining') return '#E6A23C'
      return '#F56C6C'
    },

    renderChart() {
      if (this.loading) return

      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const items = [...this.topProductionFields].reverse()

      this.chart = new Chart(canvas, {
        type: 'horizontalBar',
        data: {
          labels: items.map((item) => item.name),
          datasets: [
            {
              label: 'Суточная добыча',
              data: items.map((item) => item.dailyProduction),
              backgroundColor: items.map((item) => this.getBarColor(item.status)),
              borderWidth: 0,
              barThickness: 18
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  callback: (value) => new Intl.NumberFormat('ru-RU').format(Number(value))
                },
                gridLines: {
                  color: '#f0f2f5'
                }
              }
            ],
            yAxes: [
              {
                gridLines: {
                  display: false
                }
              }
            ]
          },
          tooltips: {
            callbacks: {
              label: (tooltipItem) =>
                ` ${new Intl.NumberFormat('ru-RU').format(Number(tooltipItem.xLabel))}`
            }
          },
          onClick: (_event, activeElements) => {
            if (!activeElements || !activeElements.length) return

            const element = activeElements[0] as { _index: number }
            const selected = items[element._index]

            if (!selected) return

            this.$store.dispatch('oilField/selectField', selected)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.oil-field-production-chart {
  border-radius: 18px;
  height: 100%;
}

.oil-field-production-chart__header {
  margin-bottom: 12px;
}

.oil-field-production-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.oil-field-production-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.oil-field-production-chart__body,
.oil-field-production-chart__skeleton {
  height: 320px;
}

.oil-field-production-chart__skeleton {
  border-radius: 12px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: oil-field-production-chart-skeleton-loading 1.4s infinite;
}

@keyframes oil-field-production-chart-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

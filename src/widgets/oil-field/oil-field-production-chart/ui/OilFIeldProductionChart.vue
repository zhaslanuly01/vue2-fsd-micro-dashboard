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

    <div class="oil-field-production-chart__body">
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
    this.renderChart()
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  },

  watch: {
    topProductionFields: {
      handler() {
        this.renderChart()
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

.oil-field-production-chart__body {
  height: 320px;
}
</style>

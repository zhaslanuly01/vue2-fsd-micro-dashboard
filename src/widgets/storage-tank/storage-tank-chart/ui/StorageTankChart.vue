<template>
  <el-card shadow="never" class="tank-chart">
    <div class="tank-chart__header">
      <div>
        <h3 class="tank-chart__title">Наиболее загруженные резервуары</h3>
        <p class="tank-chart__subtitle">Топ по заполненности, клик по столбцу открывает детали</p>
      </div>
    </div>

    <div v-if="loading" class="tank-chart__skeleton" />
    <div v-else class="tank-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { StorageTank } from '@/entities/storage-tank/model/storage-tank.types'

export default Vue.extend({
  name: 'StorageTankChart',

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
    topFilledTanks(): StorageTank[] {
      return this.$store.getters['storageTank/topFilledTanks']
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

    topFilledTanks: {
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
    getBarColor(fillPercent: number): string {
      if (fillPercent >= 85) return '#F56C6C'
      if (fillPercent >= 70) return '#E6A23C'
      return '#67C23A'
    },

    renderChart() {
      if (this.loading) return

      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const items = [...this.topFilledTanks].reverse()

      this.chart = new Chart(canvas, {
        type: 'horizontalBar',
        data: {
          labels: items.map((item) => `${item.tankNumber} · ${item.terminalName}`),
          datasets: [
            {
              label: 'Заполненность, %',
              data: items.map((item) => item.fillPercent),
              backgroundColor: items.map((item) => this.getBarColor(item.fillPercent)),
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
                  max: 100,
                  callback: (value) => `${value}%`
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
              label: (tooltipItem) => ` ${tooltipItem.xLabel}%`
            }
          },
          onClick: (_event, activeElements) => {
            if (!activeElements || !activeElements.length) return

            const element = activeElements[0] as { _index: number }
            const index = element._index
            const selected = items[index]

            if (!selected) return

            this.$store.dispatch('storageTank/selectTank', selected)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.tank-chart {
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.tank-chart__header {
  margin-bottom: 12px;
  flex: 0 0 auto;
}

.tank-chart__body,
.tank-chart__skeleton {
  flex: 1 1 auto;
  min-height: 260px;
}

.tank-chart__body {
  position: relative;
}

.tank-chart__body canvas {
  width: 100% !important;
  height: 100% !important;
}

@keyframes tank-chart-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

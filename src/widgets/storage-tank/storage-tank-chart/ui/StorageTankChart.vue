<template>
  <el-card shadow="never" class="tank-chart">
    <div class="tank-chart__header">
      <div>
        <h3 class="tank-chart__title">Наиболее загруженные резервуары</h3>
        <p class="tank-chart__subtitle">Топ по заполненности, клик по столбцу открывает детали</p>
      </div>
    </div>

    <div class="tank-chart__body">
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
    this.renderChart()
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  },

  watch: {
    topFilledTanks: {
      handler() {
        this.renderChart()
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
  height: 100%;
}

.tank-chart__header {
  margin-bottom: 12px;
}

.tank-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.tank-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.tank-chart__body {
  height: 360px;
}
</style>

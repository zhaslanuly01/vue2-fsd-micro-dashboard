<template>
  <el-card shadow="never" class="eco-emission-chart">
    <div class="eco-emission-chart__header">
      <div>
        <h3 class="eco-emission-chart__title">Станции с наибольшими выбросами</h3>
        <p class="eco-emission-chart__subtitle">Клик по столбцу открывает детали станции</p>
      </div>
    </div>

    <div class="eco-emission-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { EcoStation } from '@/entities/eco-station/model/eco-station.types'

export default Vue.extend({
  name: 'EcoStationEmissionChart',

  data() {
    return {
      chart: null as Chart | null
    }
  },

  computed: {
    topEmissionStations(): EcoStation[] {
      return this.$store.getters['ecoStation/topEmissionStations']
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
    topEmissionStations: {
      handler() {
        this.renderChart()
      },
      deep: true
    }
  },

  methods: {
    getBarColor(value: number): string {
      if (value >= 60) return '#F56C6C'
      if (value >= 35) return '#E6A23C'
      return '#67C23A'
    },

    renderChart() {
      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const items = [...this.topEmissionStations].reverse()

      this.chart = new Chart(canvas, {
        type: 'horizontalBar',
        data: {
          labels: items.map((item) => item.stationName),
          datasets: [
            {
              label: 'Уровень выбросов',
              data: items.map((item) => item.emissionLevel),
              backgroundColor: items.map((item) => this.getBarColor(item.emissionLevel)),
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
                  beginAtZero: true
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
          onClick: (_event, activeElements) => {
            if (!activeElements || !activeElements.length) return

            const element = activeElements[0] as { _index: number }
            const selected = items[element._index]

            if (!selected) return

            this.$store.dispatch('ecoStation/selectStation', selected)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.eco-emission-chart {
  border-radius: 18px;
  height: 100%;
}

.eco-emission-chart__header {
  margin-bottom: 12px;
}

.eco-emission-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.eco-emission-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.eco-emission-chart__body {
  height: 320px;
}
</style>

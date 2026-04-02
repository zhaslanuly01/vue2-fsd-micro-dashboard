<template>
  <el-card shadow="never" class="eco-status-chart">
    <div class="eco-status-chart__header">
      <div>
        <h3 class="eco-status-chart__title">Экологический статус</h3>
        <p class="eco-status-chart__subtitle">Клик по сектору применяет фильтр статуса</p>
      </div>

      <el-button v-if="!loading && activeChartStatus" type="text" @click="resetDrilldown">
        Сбросить drill-down
      </el-button>
    </div>

    <div v-if="loading" class="eco-status-chart__skeleton" />
    <div v-else class="eco-status-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { EcoStatus } from '@/entities/eco-station/model/eco-station.types'

export default Vue.extend({
  name: 'EcoStationStatusChart',

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
    statusChartData(): Array<{ label: string; value: number; status: EcoStatus }> {
      return this.$store.getters['ecoStation/statusChartData']
    },

    activeChartStatus(): EcoStatus | '' {
      return this.$store.state.ecoStation.activeChartStatus
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

    statusChartData: {
      handler() {
        if (this.loading) return
        this.$nextTick(() => {
          this.renderChart()
        })
      },
      deep: true
    },

    activeChartStatus() {
      if (this.loading) return
      this.$nextTick(() => {
        this.renderChart()
      })
    }
  },

  methods: {
    resetDrilldown() {
      this.$store.dispatch('ecoStation/drilldownByStatus', '')
    },

    renderChart() {
      if (this.loading) return

      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const colors = this.statusChartData.map((item) => {
        if (item.status === 'normal') return '#67C23A'
        if (item.status === 'attention') return '#E6A23C'
        return '#F56C6C'
      })

      this.chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: this.statusChartData.map((item) => item.label),
          datasets: [
            {
              data: this.statusChartData.map((item) => item.value),
              backgroundColor: colors,
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: 'bottom'
          },
          cutoutPercentage: 64,
          onClick: (_event, activeElements) => {
            if (!activeElements || !activeElements.length) return

            const element = activeElements[0] as { _index: number }
            const selected = this.statusChartData[element._index]

            if (!selected) return

            const nextValue = this.activeChartStatus === selected.status ? '' : selected.status
            this.$store.dispatch('ecoStation/drilldownByStatus', nextValue)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.eco-status-chart {
  border-radius: 18px;
  height: 100%;
}

.eco-status-chart__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.eco-status-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.eco-status-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.eco-status-chart__body,
.eco-status-chart__skeleton {
  height: 300px;
}

.eco-status-chart__skeleton {
  border-radius: 12px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: eco-status-chart-skeleton-loading 1.4s infinite;
}

@keyframes eco-status-chart-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

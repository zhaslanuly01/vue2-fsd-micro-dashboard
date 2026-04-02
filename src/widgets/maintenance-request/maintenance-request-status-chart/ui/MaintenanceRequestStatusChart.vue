<template>
  <el-card shadow="never" class="request-status-chart">
    <div class="request-status-chart__header">
      <div>
        <h3 class="request-status-chart__title">Статусы заявок</h3>
        <p class="request-status-chart__subtitle">Клик по сектору применяет фильтр статуса</p>
      </div>

      <el-button v-if="!loading && activeChartStatus" type="text" @click="resetDrilldown">
        Сбросить drill-down
      </el-button>
    </div>

    <div v-if="loading" class="request-status-chart__skeleton" />
    <div v-else class="request-status-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { RequestStatus } from '@/entities/maintenance-request/model/maintenance-request.types'

export default Vue.extend({
  name: 'MaintenanceRequestStatusChart',

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
    statusChartData(): Array<{ label: string; value: number; status: RequestStatus }> {
      return this.$store.getters['maintenanceRequest/statusChartData']
    },

    activeChartStatus(): RequestStatus | '' {
      return this.$store.state.maintenanceRequest.activeChartStatus
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
      this.$store.dispatch('maintenanceRequest/drilldownByStatus', '')
    },

    renderChart() {
      if (this.loading) return

      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const colors = this.statusChartData.map((item) => {
        if (item.status === 'new') return '#409EFF'
        if (item.status === 'in_progress') return '#E6A23C'
        if (item.status === 'completed') return '#67C23A'
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
            this.$store.dispatch('maintenanceRequest/drilldownByStatus', nextValue)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.request-status-chart {
  border-radius: 18px;
  height: 100%;
}

.request-status-chart__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.request-status-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.request-status-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.request-status-chart__body,
.request-status-chart__skeleton {
  height: 300px;
}

.request-status-chart__skeleton {
  border-radius: 12px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: request-status-chart-skeleton-loading 1.4s infinite;
}

@keyframes request-status-chart-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

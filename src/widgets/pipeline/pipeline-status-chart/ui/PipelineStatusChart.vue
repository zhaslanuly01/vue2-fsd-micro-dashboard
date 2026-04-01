<template>
  <el-card shadow="never" class="pipeline-status-chart">
    <div class="pipeline-status-chart__header">
      <div>
        <h3 class="pipeline-status-chart__title">Состояние сети</h3>
        <p class="pipeline-status-chart__subtitle">Клик по сектору применяет фильтр статуса</p>
      </div>

      <el-button v-if="activeChartStatus" type="text" @click="resetDrilldown">
        Сбросить drill-down
      </el-button>
    </div>

    <div class="pipeline-status-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { PipelineStatus } from '@/entities/pipeline/model/pipeline.types'

export default Vue.extend({
  name: 'PipelineStatusChart',

  data() {
    return {
      chart: null as Chart | null
    }
  },

  computed: {
    statusChartData(): Array<{ label: string; value: number; status: PipelineStatus }> {
      return this.$store.getters['pipeline/statusChartData']
    },

    activeChartStatus(): PipelineStatus | '' {
      return this.$store.state.pipeline.activeChartStatus
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
    statusChartData: {
      handler() {
        this.renderChart()
      },
      deep: true
    },
    activeChartStatus() {
      this.renderChart()
    }
  },

  methods: {
    resetDrilldown() {
      this.$store.dispatch('pipeline/drilldownByStatus', '')
    },

    renderChart() {
      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const colors = this.statusChartData.map((item) => {
        if (item.status === 'operational') return '#67C23A'
        if (item.status === 'inspection') return '#409EFF'
        if (item.status === 'repair') return '#E6A23C'
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

            this.$store.dispatch('pipeline/drilldownByStatus', nextValue)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.pipeline-status-chart {
  border-radius: 18px;
  height: 100%;
}

.pipeline-status-chart__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.pipeline-status-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.pipeline-status-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.pipeline-status-chart__body {
  height: 320px;
}
</style>

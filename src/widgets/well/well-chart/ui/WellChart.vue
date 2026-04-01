<template>
  <el-card shadow="never" class="well-chart">
    <div class="well-chart__header">
      <div>
        <h3 class="well-chart__title">Распределение по статусам</h3>
        <p class="well-chart__subtitle">Клик по сектору применяет фильтр</p>
      </div>

      <el-button v-if="activeChartStatus" type="text" @click="resetDrilldown">
        Сбросить drill-down
      </el-button>
    </div>

    <div class="well-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { WellStatus } from '@/entities/well/model/well.types'

export default Vue.extend({
  name: 'WellChart',

  data() {
    return {
      chart: null as Chart | null
    }
  },

  computed: {
    statusChartData(): Array<{ label: string; value: number; status: WellStatus }> {
      return this.$store.getters['well/statusChartData']
    },

    activeChartStatus(): WellStatus | '' {
      return this.$store.state.well.activeChartStatus
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
      this.$store.dispatch('well/drilldownByStatus', '')
    },

    renderChart() {
      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const colors = this.statusChartData.map((item) => {
        if (item.status === 'active') return '#67C23A'
        if (item.status === 'inactive') return '#909399'
        if (item.status === 'maintenance') return '#E6A23C'
        return '#F56C6C'
      })

      this.chart = new Chart(canvas, {
        type: 'pie',
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
          onClick: (_event, activeElements) => {
            if (!activeElements || !activeElements.length) return

            const element = activeElements[0] as { _index: number }

            const index = element._index
            const selected = this.statusChartData[index]

            if (!selected) return

            const nextValue = this.activeChartStatus === selected.status ? '' : selected.status

            this.$store.dispatch('well/drilldownByStatus', nextValue)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.well-chart {
  border-radius: 16px;
  height: 100%;
}

.well-chart__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.well-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.well-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.well-chart__body {
  height: 320px;
}
</style>

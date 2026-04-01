<template>
  <el-card shadow="never" class="oil-field-status-chart">
    <div class="oil-field-status-chart__header">
      <div>
        <h3 class="oil-field-status-chart__title">Статусы месторождений</h3>
        <p class="oil-field-status-chart__subtitle">Клик по сектору применяет фильтр статуса</p>
      </div>

      <el-button v-if="activeChartStatus" type="text" @click="resetDrilldown">
        Сбросить drill-down
      </el-button>
    </div>

    <div class="oil-field-status-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { FieldStatus } from '@/entities/oil-field/model/oil-field.types'

export default Vue.extend({
  name: 'OilFieldStatusChart',

  data() {
    return {
      chart: null as Chart | null
    }
  },

  computed: {
    statusChartData(): Array<{ label: string; value: number; status: FieldStatus }> {
      return this.$store.getters['oilField/statusChartData']
    },

    activeChartStatus(): FieldStatus | '' {
      return this.$store.state.oilField.activeChartStatus
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
      this.$store.dispatch('oilField/drilldownByStatus', '')
    },

    renderChart() {
      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const colors = this.statusChartData.map((item) => {
        if (item.status === 'stable') return '#67C23A'
        if (item.status === 'growing') return '#409EFF'
        if (item.status === 'declining') return '#E6A23C'
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

            this.$store.dispatch('oilField/drilldownByStatus', nextValue)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.oil-field-status-chart {
  border-radius: 18px;
  height: 100%;
}

.oil-field-status-chart__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.oil-field-status-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.oil-field-status-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.oil-field-status-chart__body {
  height: 300px;
}
</style>

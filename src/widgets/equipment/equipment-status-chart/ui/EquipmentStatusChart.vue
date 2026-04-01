<template>
  <el-card shadow="never" class="equipment-chart">
    <div class="equipment-chart__header">
      <div>
        <h3 class="equipment-chart__title">Состояние оборудования</h3>
        <p class="equipment-chart__subtitle">Клик по сектору применяет фильтр статуса</p>
      </div>

      <el-button v-if="activeChartStatus" type="text" @click="resetDrilldown">
        Сбросить drill-down
      </el-button>
    </div>

    <div class="equipment-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { EquipmentStatus } from '@/entities/equipment/model/equipment.types'

export default Vue.extend({
  name: 'EquipmentStatusChart',

  data() {
    return {
      chart: null as Chart | null
    }
  },

  computed: {
    statusChartData(): Array<{ label: string; value: number; status: EquipmentStatus }> {
      return this.$store.getters['equipment/statusChartData']
    },

    activeChartStatus(): EquipmentStatus | '' {
      return this.$store.state.equipment.activeChartStatus
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
      this.$store.dispatch('equipment/drilldownByStatus', '')
    },

    renderChart() {
      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const colors = this.statusChartData.map((item) => {
        if (item.status === 'operational') return '#67C23A'
        if (item.status === 'warning') return '#E6A23C'
        if (item.status === 'critical') return '#F56C6C'
        return '#909399'
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

            this.$store.dispatch('equipment/drilldownByStatus', nextValue)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.equipment-chart {
  border-radius: 18px;
  height: 100%;
}

.equipment-chart__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.equipment-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.equipment-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.equipment-chart__body {
  height: 320px;
}
</style>

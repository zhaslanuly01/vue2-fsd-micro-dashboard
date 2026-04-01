<template>
  <el-card shadow="never" class="request-cost-chart">
    <div class="request-cost-chart__header">
      <div>
        <h3 class="request-cost-chart__title">Самые дорогие заявки</h3>
        <p class="request-cost-chart__subtitle">Клик по столбцу открывает карточку заявки</p>
      </div>
    </div>

    <div class="request-cost-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { MaintenanceRequest } from '@/entities/maintenance-request/model/maintenance-request.types'

export default Vue.extend({
  name: 'MaintenanceRequestCostChart',

  data() {
    return {
      chart: null as Chart | null
    }
  },

  computed: {
    topCostRequests(): MaintenanceRequest[] {
      return this.$store.getters['maintenanceRequest/topCostRequests']
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
    topCostRequests: {
      handler() {
        this.renderChart()
      },
      deep: true
    }
  },

  methods: {
    getBarColor(priority: MaintenanceRequest['priority']): string {
      if (priority === 'high') return '#F56C6C'
      if (priority === 'medium') return '#E6A23C'
      return '#67C23A'
    },

    renderChart() {
      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const items = [...this.topCostRequests].reverse()

      this.chart = new Chart(canvas, {
        type: 'horizontalBar',
        data: {
          labels: items.map((item) => item.title),
          datasets: [
            {
              label: 'Стоимость',
              data: items.map((item) => item.cost),
              backgroundColor: items.map((item) => this.getBarColor(item.priority)),
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

            this.$store.dispatch('maintenanceRequest/selectRequest', selected)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.request-cost-chart {
  border-radius: 18px;
  height: 100%;
}

.request-cost-chart__header {
  margin-bottom: 12px;
}

.request-cost-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.request-cost-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.request-cost-chart__body {
  height: 320px;
}
</style>

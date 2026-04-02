<template>
  <el-card shadow="never" class="pipeline-chart">
    <div class="pipeline-chart__header">
      <div>
        <h3 class="pipeline-chart__title">Участки с наибольшей пропускной способностью</h3>
        <p class="pipeline-chart__subtitle">Клик по столбцу открывает детали участка</p>
      </div>
    </div>

    <div v-if="loading" class="pipeline-chart__skeleton" />
    <div v-else class="pipeline-chart__body">
      <canvas ref="canvas"></canvas>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import Chart from 'chart.js'
import type { PipelineSection } from '@/entities/pipeline'

export default Vue.extend({
  name: 'PipelineThroughputChart',

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
    topThroughputSections(): PipelineSection[] {
      return this.$store.getters['pipeline/topThroughputSections']
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

    topThroughputSections: {
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
    getBarColor(pressure: number): string {
      if (pressure >= 100) return '#F56C6C'
      if (pressure >= 80) return '#E6A23C'
      return '#67C23A'
    },

    renderChart() {
      if (this.loading) return

      if (this.chart) {
        this.chart.destroy()
      }

      const canvas = this.$refs.canvas as HTMLCanvasElement | undefined
      if (!canvas) return

      const items = [...this.topThroughputSections].reverse()

      this.chart = new Chart(canvas, {
        type: 'horizontalBar',
        data: {
          labels: items.map((item) => item.sectionName),
          datasets: [
            {
              label: 'Пропускная способность',
              data: items.map((item) => item.throughput),
              backgroundColor: items.map((item) => this.getBarColor(item.pressure)),
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

            this.$store.dispatch('pipeline/selectPipeline', selected)
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.pipeline-chart {
  border-radius: 18px;
  height: 100%;
}

.pipeline-chart__header {
  margin-bottom: 12px;
}

.pipeline-chart__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.pipeline-chart__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.pipeline-chart__body,
.pipeline-chart__skeleton {
  height: 340px;
}

.pipeline-chart__skeleton {
  border-radius: 12px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: pipeline-chart-skeleton-loading 1.4s infinite;
}

@keyframes pipeline-chart-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

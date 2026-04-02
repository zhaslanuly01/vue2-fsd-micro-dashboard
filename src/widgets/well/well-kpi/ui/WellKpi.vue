<template>
  <div class="well-kpi">
    <el-card shadow="never" class="well-kpi__card">
      <div class="well-kpi__label">Всего скважин</div>
      <template v-if="loading">
        <div class="well-kpi__skeleton well-kpi__skeleton--value" />
      </template>
      <div v-else class="well-kpi__value">{{ kpi.total }}</div>
    </el-card>

    <el-card shadow="never" class="well-kpi__card">
      <div class="well-kpi__label">Активные</div>
      <template v-if="loading">
        <div class="well-kpi__skeleton well-kpi__skeleton--value" />
      </template>
      <div v-else class="well-kpi__value">{{ kpi.active }}</div>
    </el-card>

    <el-card shadow="never" class="well-kpi__card">
      <div class="well-kpi__label">Средний дебит</div>
      <template v-if="loading">
        <div class="well-kpi__skeleton well-kpi__skeleton--value" />
      </template>
      <div v-else class="well-kpi__value">{{ kpi.avgOilRate }}</div>
    </el-card>

    <el-card shadow="never" class="well-kpi__card">
      <div class="well-kpi__label">Среднее давление</div>
      <template v-if="loading">
        <div class="well-kpi__skeleton well-kpi__skeleton--value" />
      </template>
      <div v-else class="well-kpi__value">{{ kpi.avgPressure }}</div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'WellKpi',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    kpi(): {
      total: number
      active: number
      avgOilRate: number
      avgPressure: number
    } {
      return this.$store.getters['well/kpi']
    }
  }
})
</script>

<style scoped>
.well-kpi {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
}

.well-kpi__card {
  border-radius: 16px;
}

.well-kpi__label {
  font-size: 14px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.well-kpi__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--label-primary);
}

.well-kpi__skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: well-kpi-skeleton-loading 1.4s infinite;
}

.well-kpi__skeleton--value {
  width: 120px;
  height: 34px;
}

@keyframes well-kpi-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1200px) {
  .well-kpi {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .well-kpi {
    grid-template-columns: 1fr;
  }
}
</style>

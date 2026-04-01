<template>
  <div class="well-kpi">
    <el-card shadow="never" class="well-kpi__card">
      <div class="well-kpi__label">Всего скважин</div>
      <div class="well-kpi__value">{{ kpi.total }}</div>
    </el-card>

    <el-card shadow="never" class="well-kpi__card">
      <div class="well-kpi__label">Активные</div>
      <div class="well-kpi__value">{{ kpi.active }}</div>
    </el-card>

    <el-card shadow="never" class="well-kpi__card">
      <div class="well-kpi__label">Средний дебит</div>
      <div class="well-kpi__value">{{ kpi.avgOilRate }}</div>
    </el-card>

    <el-card shadow="never" class="well-kpi__card">
      <div class="well-kpi__label">Среднее давление</div>
      <div class="well-kpi__value">{{ kpi.avgPressure }}</div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'WellKpi',

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

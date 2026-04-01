<template>
  <div class="oil-field-kpi">
    <el-card shadow="never" class="oil-field-kpi__card">
      <div class="oil-field-kpi__label">Всего месторождений</div>
      <div class="oil-field-kpi__value">{{ kpi.total }}</div>
      <div class="oil-field-kpi__hint">По текущим фильтрам</div>
    </el-card>

    <el-card shadow="never" class="oil-field-kpi__card">
      <div class="oil-field-kpi__label">Растущие</div>
      <div class="oil-field-kpi__value">{{ kpi.growing }}</div>
      <div class="oil-field-kpi__hint">Статус growing</div>
    </el-card>

    <el-card shadow="never" class="oil-field-kpi__card">
      <div class="oil-field-kpi__label">Суточная добыча</div>
      <div class="oil-field-kpi__value">{{ formatNumber(kpi.totalDailyProduction) }}</div>
      <div class="oil-field-kpi__hint">Суммарно по выборке</div>
    </el-card>

    <el-card shadow="never" class="oil-field-kpi__card">
      <div class="oil-field-kpi__label">Исполнение плана</div>
      <div class="oil-field-kpi__value">{{ kpi.avgPlanExecution }}%</div>
      <div class="oil-field-kpi__hint">Среднее yearlyFact / yearlyPlan</div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'OilFieldKpi',

  computed: {
    kpi(): {
      total: number
      growing: number
      totalDailyProduction: number
      avgPlanExecution: number
    } {
      return this.$store.getters['oilField/kpi']
    }
  },

  methods: {
    formatNumber(value: number): string {
      return new Intl.NumberFormat('ru-RU').format(value)
    }
  }
})
</script>

<style scoped>
.oil-field-kpi {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
}

.oil-field-kpi__card {
  border-radius: 18px;
}

.oil-field-kpi__label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.oil-field-kpi__value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--label-primary);
}

.oil-field-kpi__hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--label-secondary);
}

@media (max-width: 1200px) {
  .oil-field-kpi {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .oil-field-kpi {
    grid-template-columns: 1fr;
  }
}
</style>

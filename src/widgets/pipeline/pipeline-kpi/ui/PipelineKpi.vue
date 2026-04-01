<template>
  <div class="pipeline-kpi">
    <el-card shadow="never" class="pipeline-kpi__card">
      <div class="pipeline-kpi__label">Всего участков</div>
      <div class="pipeline-kpi__value">{{ kpi.total }}</div>
      <div class="pipeline-kpi__hint">По текущим фильтрам</div>
    </el-card>

    <el-card shadow="never" class="pipeline-kpi__card">
      <div class="pipeline-kpi__label">Работают штатно</div>
      <div class="pipeline-kpi__value">{{ kpi.operational }}</div>
      <div class="pipeline-kpi__hint">Статус operational</div>
    </el-card>

    <el-card shadow="never" class="pipeline-kpi__card">
      <div class="pipeline-kpi__label">Общая длина</div>
      <div class="pipeline-kpi__value">{{ kpi.totalLengthKm }} км</div>
      <div class="pipeline-kpi__hint">Суммарная протяженность</div>
    </el-card>

    <el-card shadow="never" class="pipeline-kpi__card">
      <div class="pipeline-kpi__label">Среднее давление</div>
      <div class="pipeline-kpi__value">{{ kpi.avgPressure }}</div>
      <div class="pipeline-kpi__hint">Среднее по участкам</div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'PipelineKpi',

  computed: {
    kpi(): {
      total: number
      operational: number
      totalLengthKm: number
      avgPressure: number
    } {
      return this.$store.getters['pipeline/kpi']
    }
  }
})
</script>

<style scoped>
.pipeline-kpi {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
}

.pipeline-kpi__card {
  border-radius: 18px;
}

.pipeline-kpi__label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.pipeline-kpi__value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--label-primary);
}

.pipeline-kpi__hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--label-secondary);
}

@media (max-width: 1200px) {
  .pipeline-kpi {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .pipeline-kpi {
    grid-template-columns: 1fr;
  }
}
</style>

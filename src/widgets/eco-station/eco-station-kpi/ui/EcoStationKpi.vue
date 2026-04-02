<template>
  <div class="eco-kpi">
    <el-card shadow="never" class="eco-kpi__card">
      <div class="eco-kpi__label">Всего станций</div>
      <div v-if="loading" class="eco-kpi__skeleton eco-kpi__skeleton--value" />
      <div v-else class="eco-kpi__value">{{ kpi.total }}</div>
      <div class="eco-kpi__hint">По текущим фильтрам</div>
    </el-card>

    <el-card shadow="never" class="eco-kpi__card">
      <div class="eco-kpi__label">Нормальный статус</div>
      <div v-if="loading" class="eco-kpi__skeleton eco-kpi__skeleton--value" />
      <div v-else class="eco-kpi__value">{{ kpi.normal }}</div>
      <div class="eco-kpi__hint">Без экологических отклонений</div>
    </el-card>

    <el-card shadow="never" class="eco-kpi__card">
      <div class="eco-kpi__label">Средний уровень выбросов</div>
      <div v-if="loading" class="eco-kpi__skeleton eco-kpi__skeleton--value" />
      <div v-else class="eco-kpi__value">{{ kpi.avgEmissionLevel }}</div>
      <div class="eco-kpi__hint">Показатель emissionLevel</div>
    </el-card>

    <el-card shadow="never" class="eco-kpi__card">
      <div class="eco-kpi__label">Средний индекс воды</div>
      <div v-if="loading" class="eco-kpi__skeleton eco-kpi__skeleton--value" />
      <div v-else class="eco-kpi__value">{{ kpi.avgWaterQualityIndex }}</div>
      <div class="eco-kpi__hint">Показатель waterQualityIndex</div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'EcoStationKpi',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    kpi(): {
      total: number
      normal: number
      avgEmissionLevel: number
      avgWaterQualityIndex: number
    } {
      return this.$store.getters['ecoStation/kpi']
    }
  }
})
</script>

<style scoped>
.eco-kpi {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
}

.eco-kpi__card {
  border-radius: 18px;
}

.eco-kpi__label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.eco-kpi__value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--label-primary);
}

.eco-kpi__hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--label-secondary);
}

.eco-kpi__skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: eco-kpi-skeleton-loading 1.4s infinite;
}

.eco-kpi__skeleton--value {
  width: 130px;
  height: 34px;
}

@keyframes eco-kpi-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1200px) {
  .eco-kpi {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .eco-kpi {
    grid-template-columns: 1fr;
  }
}
</style>

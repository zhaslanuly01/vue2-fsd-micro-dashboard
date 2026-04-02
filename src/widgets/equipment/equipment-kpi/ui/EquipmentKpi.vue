<template>
  <div class="equipment-kpi">
    <el-card shadow="never" class="equipment-kpi__card">
      <div class="equipment-kpi__label">Всего единиц</div>
      <div v-if="loading" class="equipment-kpi__skeleton equipment-kpi__skeleton--value" />
      <div v-else class="equipment-kpi__value">{{ kpi.total }}</div>
      <div class="equipment-kpi__hint">По текущим фильтрам</div>
    </el-card>

    <el-card shadow="never" class="equipment-kpi__card">
      <div class="equipment-kpi__label">Работает штатно</div>
      <div v-if="loading" class="equipment-kpi__skeleton equipment-kpi__skeleton--value" />
      <div v-else class="equipment-kpi__value">{{ kpi.operational }}</div>
      <div class="equipment-kpi__hint">Статус operational</div>
    </el-card>

    <el-card shadow="never" class="equipment-kpi__card">
      <div class="equipment-kpi__label">Средняя эффективность</div>
      <div v-if="loading" class="equipment-kpi__skeleton equipment-kpi__skeleton--value" />
      <div v-else class="equipment-kpi__value">{{ kpi.avgEfficiency }}%</div>
      <div class="equipment-kpi__hint">Среднее значение efficiency</div>
    </el-card>

    <el-card shadow="never" class="equipment-kpi__card">
      <div class="equipment-kpi__label">Средняя температура</div>
      <div v-if="loading" class="equipment-kpi__skeleton equipment-kpi__skeleton--value" />
      <div v-else class="equipment-kpi__value">{{ kpi.avgTemperature }}°C</div>
      <div class="equipment-kpi__hint">Среднее по оборудованию</div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'EquipmentKpi',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    kpi(): {
      total: number
      operational: number
      avgEfficiency: number
      avgTemperature: number
    } {
      return this.$store.getters['equipment/kpi']
    }
  }
})
</script>

<style scoped>
.equipment-kpi {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
}

.equipment-kpi__card {
  border-radius: 18px;
}

.equipment-kpi__label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.equipment-kpi__value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--label-primary);
}

.equipment-kpi__hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--label-secondary);
}

.equipment-kpi__skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: equipment-kpi-skeleton-loading 1.4s infinite;
}

.equipment-kpi__skeleton--value {
  width: 130px;
  height: 34px;
}

@keyframes equipment-kpi-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1200px) {
  .equipment-kpi {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .equipment-kpi {
    grid-template-columns: 1fr;
  }
}
</style>

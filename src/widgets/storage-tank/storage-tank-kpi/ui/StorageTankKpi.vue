<template>
  <div class="tank-kpi">
    <el-card shadow="never" class="tank-kpi__card">
      <div class="tank-kpi__label">Всего резервуаров</div>
      <div class="tank-kpi__value">{{ kpi.total }}</div>
      <div class="tank-kpi__hint">По текущим фильтрам</div>
    </el-card>

    <el-card shadow="never" class="tank-kpi__card">
      <div class="tank-kpi__label">Нормальный режим</div>
      <div class="tank-kpi__value">{{ kpi.normal }}</div>
      <div class="tank-kpi__hint">Без повышенной нагрузки</div>
    </el-card>

    <el-card shadow="never" class="tank-kpi__card">
      <div class="tank-kpi__label">Средняя заполненность</div>
      <div class="tank-kpi__value">{{ kpi.avgFillPercent }}%</div>
      <div class="tank-kpi__hint">Средний fillPercent</div>
    </el-card>

    <el-card shadow="never" class="tank-kpi__card">
      <div class="tank-kpi__label">Текущий объем</div>
      <div class="tank-kpi__value">{{ formatNumber(kpi.totalCurrentVolume) }}</div>
      <div class="tank-kpi__hint">Суммарно по резервуарам</div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'StorageTankKpi',

  computed: {
    kpi(): {
      total: number
      normal: number
      avgFillPercent: number
      totalCurrentVolume: number
    } {
      return this.$store.getters['storageTank/kpi']
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
.tank-kpi {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
}

.tank-kpi__card {
  border-radius: 18px;
  border: 1px solid #ebeef5;
}

.tank-kpi__label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.tank-kpi__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--label-primary);
  line-height: 1.2;
}

.tank-kpi__hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--label-secondary);
}

@media (max-width: 1200px) {
  .tank-kpi {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .tank-kpi {
    grid-template-columns: 1fr;
  }
}
</style>

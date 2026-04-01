<template>
  <div class="request-kpi">
    <el-card shadow="never" class="request-kpi__card">
      <div class="request-kpi__label">Всего заявок</div>
      <div class="request-kpi__value">{{ kpi.total }}</div>
      <div class="request-kpi__hint">По текущим фильтрам</div>
    </el-card>

    <el-card shadow="never" class="request-kpi__card">
      <div class="request-kpi__label">Новые</div>
      <div class="request-kpi__value">{{ kpi.newCount }}</div>
      <div class="request-kpi__hint">Ожидают старта работ</div>
    </el-card>

    <el-card shadow="never" class="request-kpi__card">
      <div class="request-kpi__label">В работе</div>
      <div class="request-kpi__value">{{ kpi.inProgressCount }}</div>
      <div class="request-kpi__hint">Активные заявки</div>
    </el-card>

    <el-card shadow="never" class="request-kpi__card">
      <div class="request-kpi__label">Суммарная стоимость</div>
      <div class="request-kpi__value">{{ formatMoney(kpi.totalCost) }}</div>
      <div class="request-kpi__hint">По текущей выборке</div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'MaintenanceRequestKpi',

  computed: {
    kpi(): {
      total: number
      newCount: number
      inProgressCount: number
      totalCost: number
    } {
      return this.$store.getters['maintenanceRequest/kpi']
    }
  },

  methods: {
    formatMoney(value: number): string {
      return new Intl.NumberFormat('ru-RU').format(value)
    }
  }
})
</script>

<style scoped>
.request-kpi {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
}

.request-kpi__card {
  border-radius: 18px;
}

.request-kpi__label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 10px;
}

.request-kpi__value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--label-primary);
}

.request-kpi__hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--label-secondary);
}

@media (max-width: 1200px) {
  .request-kpi {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .request-kpi {
    grid-template-columns: 1fr;
  }
}
</style>

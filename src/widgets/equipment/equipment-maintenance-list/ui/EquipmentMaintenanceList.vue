<template>
  <el-card shadow="never" class="equipment-maintenance">
    <div class="equipment-maintenance__header">
      <div>
        <h3 class="equipment-maintenance__title">Ближайшее обслуживание</h3>
        <p class="equipment-maintenance__subtitle">Приоритетные единицы по дате ТО</p>
      </div>
    </div>

    <div class="equipment-maintenance__list">
      <div
        v-for="item in nearestMaintenanceItems"
        :key="item.id"
        class="equipment-maintenance__item"
        @click="handleSelect(item)"
      >
        <div class="equipment-maintenance__left">
          <div class="equipment-maintenance__name">{{ item.name }}</div>
          <div class="equipment-maintenance__meta">
            {{ formatType(item.type) }} · {{ item.fieldName }}
          </div>
        </div>

        <div class="equipment-maintenance__right">
          <el-tag :type="getStatusTagType(item.status)" effect="plain">
            {{ formatStatus(item.status) }}
          </el-tag>
          <div class="equipment-maintenance__date">
            {{ item.nextMaintenanceDate }}
          </div>
        </div>
      </div>

      <div v-if="!nearestMaintenanceItems.length" class="equipment-maintenance__empty">
        Нет данных
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import type {
  EquipmentStatus,
  EquipmentType,
  EquipmentUnit
} from '@/entities/equipment/model/equipment.types'

export default Vue.extend({
  name: 'EquipmentMaintenanceList',

  computed: {
    nearestMaintenanceItems(): EquipmentUnit[] {
      const items = this.$store.getters['equipment/filteredItems'] as EquipmentUnit[]

      return [...items]
        .sort((a, b) => {
          return (
            new Date(a.nextMaintenanceDate).getTime() - new Date(b.nextMaintenanceDate).getTime()
          )
        })
        .slice(0, 6)
    }
  },

  methods: {
    handleSelect(item: EquipmentUnit) {
      this.$store.dispatch('equipment/selectEquipment', item)
    },

    formatStatus(status: EquipmentStatus) {
      const map: Record<EquipmentStatus, string> = {
        operational: 'Работает',
        warning: 'Предупреждение',
        critical: 'Критическое',
        offline: 'Оффлайн'
      }

      return map[status]
    },

    formatType(type: EquipmentType) {
      const map: Record<EquipmentType, string> = {
        pump: 'Насос',
        compressor: 'Компрессор',
        separator: 'Сепаратор',
        generator: 'Генератор'
      }

      return map[type]
    },

    getStatusTagType(status: EquipmentStatus) {
      const map: Record<EquipmentStatus, string> = {
        operational: 'success',
        warning: 'warning',
        critical: 'danger',
        offline: 'info'
      }

      return map[status]
    }
  }
})
</script>

<style scoped>
.equipment-maintenance {
  border-radius: 18px;
  height: 100%;
}

.equipment-maintenance__header {
  margin-bottom: 12px;
}

.equipment-maintenance__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.equipment-maintenance__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.equipment-maintenance__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.equipment-maintenance__item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s ease;
}

.equipment-maintenance__item:hover {
  background: #f8fafc;
  border-color: #dcdfe6;
}

.equipment-maintenance__left,
.equipment-maintenance__right {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.equipment-maintenance__name {
  font-weight: 600;
  color: var(--label-primary);
}

.equipment-maintenance__meta,
.equipment-maintenance__date {
  font-size: 13px;
  color: var(--label-secondary);
}

.equipment-maintenance__right {
  align-items: flex-end;
}

.equipment-maintenance__empty {
  color: var(--label-secondary);
  padding: 24px 0;
}
</style>

<template>
  <el-card shadow="never" class="equipment-maintenance">
    <div class="equipment-maintenance__header">
      <div>
        <h3 class="equipment-maintenance__title">Ближайшее обслуживание</h3>
        <p class="equipment-maintenance__subtitle">Приоритетные единицы по дате ТО</p>
      </div>
    </div>

    <div class="equipment-maintenance__list">
      <template v-if="loading">
        <div v-for="n in 6" :key="n" class="equipment-maintenance__item">
          <div class="equipment-maintenance__left">
            <div class="equipment-maintenance__skeleton equipment-maintenance__skeleton--name" />
            <div class="equipment-maintenance__skeleton equipment-maintenance__skeleton--meta" />
          </div>

          <div class="equipment-maintenance__right">
            <div class="equipment-maintenance__skeleton equipment-maintenance__skeleton--tag" />
            <div class="equipment-maintenance__skeleton equipment-maintenance__skeleton--date" />
          </div>
        </div>
      </template>

      <template v-else>
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
      </template>
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

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

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

.equipment-maintenance__skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: equipment-maintenance-skeleton-loading 1.4s infinite;
}

.equipment-maintenance__skeleton--name {
  width: 160px;
  height: 18px;
}

.equipment-maintenance__skeleton--meta {
  width: 130px;
  height: 14px;
}

.equipment-maintenance__skeleton--tag {
  width: 90px;
  height: 24px;
}

.equipment-maintenance__skeleton--date {
  width: 100px;
  height: 14px;
}

@keyframes equipment-maintenance-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

<template>
  <el-card shadow="never" class="chart-card">
    <h3 class="chart-card__title">{{ title }}</h3>
    <div class="chart-card__body">
      <slot />
    </div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ChartCard',

  props: {
    title: {
      type: String,
      required: true
    }
  }
})
</script>

<style scoped>
.chart-card {
  border-radius: 16px;
}

.chart-card__title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.chart-card__body {
  height: 320px;
}
</style>

<template>
  <div class="location-node" :class="{ selected }">
    <div class="node-header">
      <UIcon name="i-heroicons-map-pin" class="node-icon" />
      <div class="node-title">{{ data.label }}</div>
    </div>
    <div class="node-content">
      <div v-if="data.properties.type" class="property">
        <span class="property-label">类型:</span>
        <span class="property-value">{{ data.properties.type }}</span>
      </div>
      <div v-if="data.properties.inhabitants" class="property">
        <span class="property-label">居民:</span>
        <span class="property-value">{{ data.properties.inhabitants.join(', ') }}</span>
      </div>
      <div v-if="data.properties.resources" class="property">
        <span class="property-label">资源:</span>
        <span class="property-value">{{ data.properties.resources.join(', ') }}</span>
      </div>
    </div>
    <Handle type="source" :position="sourcePosition" class="handle" />
    <Handle type="target" :position="targetPosition" class="handle" />
  </div>
</template>

<script setup lang="ts">
import { Handle } from '@vue-flow/core'

// 定义props接口
interface Props {
  id: string
  data: any
  selected: boolean
  sourcePosition: any
  targetPosition: any
}

// 声明props
const props = defineProps<Props>()
</script>

<style scoped>
.location-node {
  min-width: 200px;
  min-height: 100px;
  border: 2px solid #10b981;
  border-radius: 8px;
  background: white;
  padding: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.location-node.selected {
  border-color: #047857;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

.node-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.node-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #059669;
}

.node-title {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
}

.node-content {
  font-size: 12px;
}

.property {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.property-label {
  color: #6b7280;
  font-weight: 500;
}

.property-value {
  color: #1f2937;
}

.handle {
  width: 8px;
  height: 8px;
  background: #6b7280;
  border-radius: 100%;
}
</style>
<template>
  <div class="character-node" :class="{ selected }">
    <div class="node-header">
      <UIcon name="i-heroicons-user" class="node-icon" />
      <div class="node-title">{{ data.label }}</div>
    </div>
    <div class="node-content">
      <div v-if="data.properties.role" class="property">
        <span class="property-label">角色:</span>
        <span class="property-value">{{ data.properties.role }}</span>
      </div>
      <div v-if="data.properties.powerLevel" class="property">
        <span class="property-label">战力:</span>
        <span class="property-value">{{ data.properties.powerLevel }}</span>
      </div>
      <div v-if="data.properties.status" class="property">
        <span class="property-label">状态:</span>
        <span class="property-value">{{ data.properties.status }}</span>
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
.character-node {
  min-width: 200px;
  min-height: 100px;
  border: 2px solid #9ca3af;
  border-radius: 8px;
  background: white;
  padding: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.character-node.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
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
  color: #3b82f6;
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
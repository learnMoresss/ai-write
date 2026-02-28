<template>
  <div class="default-node" :class="{ selected }">
    <div class="node-header">
      <UIcon name="i-heroicons-square-3-stack-3d" class="node-icon" />
      <div class="node-title">{{ data.label }}</div>
    </div>
    <div class="node-content">
      <div v-if="data.properties.description" class="property">
        <span class="property-label">描述:</span>
        <span class="property-value">{{ truncateText(data.properties.description, 60) }}</span>
      </div>
      <div v-for="(value, key) in data.properties" :key="key" class="property" v-if="!excludedProperties.includes(key)">
        <span class="property-label">{{ key }}:</span>
        <span class="property-value">{{ typeof value === 'object' ? JSON.stringify(value) : value }}</span>
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

// 不显示的属性
const excludedProperties = ['label', 'description']

// 截断文本的方法
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.default-node {
  min-width: 200px;
  min-height: 100px;
  border: 2px solid #6b7280;
  border-radius: 8px;
  background: white;
  padding: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.default-node.selected {
  border-color: #4b5563;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.3);
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
  color: #4b5563;
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
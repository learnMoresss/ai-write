<!-- components/graph/EdgeControls.vue -->
<template>
  <div class="edge-controls">
    <div class="header flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg">关系详情</h3>
      <UButton
        icon="i-heroicons-x-mark"
        variant="ghost"
        color="gray"
        size="xs"
        @click="$emit('close')"
      />
    </div>

    <div class="form-group mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">关系类型</label>
      <UInput
        v-model="localEdge.data.relation"
        @update:model-value="updateEdge"
      />
    </div>

    <div class="form-group mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">关系强度</label>
      <URange
        v-model="localEdge.data.weight"
        min="-1"
        max="1"
        step="0.1"
        @update:model-value="updateEdge"
      />
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>负向</span>
        <span>中性</span>
        <span>正向</span>
      </div>
    </div>

    <div class="form-group mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
      <UTextarea
        v-model="localEdge.data.description"
        rows="3"
        @update:model-value="updateEdge"
      />
    </div>

    <div class="actions flex space-x-2">
      <UButton
        icon="i-heroicons-trash"
        color="red"
        variant="outline"
        @click="deleteCurrentEdge"
      >
        删除关系
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EntityEdge } from '~/types/entity'

interface Props {
  edge: EntityEdge
}

interface Emits {
  (e: 'update', edge: EntityEdge): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localEdge = ref<EntityEdge>(JSON.parse(JSON.stringify(props.edge)))

const updateEdge = () => {
  emit('update', localEdge.value)
}

const deleteCurrentEdge = () => {
  // 这里需要通过emit向父组件传递删除信号
  console.log('删除关系功能待实现')
}
</script>
<!-- components/graph/NodeDetails.vue -->
<template>
  <div class="node-details">
    <div class="header flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg">{{ node.data.label }}</h3>
      <UButton
        icon="i-heroicons-x-mark"
        variant="ghost"
        color="gray"
        size="xs"
        @click="$emit('close')"
      />
    </div>

    <div class="form-group mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
      <UInput v-model="localNode.data.label" @update:model-value="updateNode" />
    </div>

    <div class="form-group mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
      <USelectMenu
        :options="nodeTypes"
        :model-value="localNode.data.type"
        value-attribute="value"
        option-attribute="label"
        @update:model-value="updateNodeType"
      />
    </div>

    <div class="form-group mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
      <UTextarea
        v-model="localNode.data.description"
        rows="3"
        @update:model-value="updateNode"
      />
    </div>

    <div class="form-group mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">属性</label>
      <div v-for="(value, key) in localNode.data.properties" :key="key" class="flex items-center mb-2">
        <UInput
          :model-value="key"
          class="flex-1 mr-2"
          disabled
        />
        <UInput
          :model-value="value"
          class="flex-1"
          @update:model-value="updateProperty(key, $event)"
        />
      </div>
      <UButton
        icon="i-heroicons-plus"
        size="xs"
        variant="outline"
        @click="addProperty"
      >
        添加属性
      </UButton>
    </div>

    <div class="actions flex space-x-2">
      <UButton
        icon="i-heroicons-trash"
        color="red"
        variant="outline"
        @click="deleteCurrentNode"
      >
        删除节点
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EntityNode } from '~/types/entity'

defineProps<{
  node: EntityNode
}>()

defineEmits(['update', 'close'])

const localNode = ref<EntityNode>(JSON.parse(JSON.stringify(props.node)))

const nodeTypes = [
  { label: '人物', value: 'character' },
  { label: '地点', value: 'location' },
  { label: '物品', value: 'item' },
  { label: '组织', value: 'organization' }
]

const updateNode = () => {
  emit('update', localNode.value)
}

const updateNodeType = (newType: string) => {
  localNode.value.data.type = newType as any
  updateNode()
}

const updateProperty = (key: string, value: any) => {
  localNode.value.data.properties[key] = value
  updateNode()
}

const addProperty = () => {
  const propName = prompt('请输入属性名:')
  if (propName) {
    localNode.value.data.properties[propName] = ''
    updateNode()
  }
}

const deleteCurrentNode = () => {
  // 这里需要通过emit向父组件传递删除信号
  console.log('删除节点功能待实现')
}
</script>
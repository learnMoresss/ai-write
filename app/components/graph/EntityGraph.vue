<template>
  <div class="entity-graph-container">
    <div class="graph-toolbar">
      <UButton
        icon="i-heroicons-magnifying-glass"
        variant="ghost"
        @click="enableSearch"
      >
        搜索节点
      </UButton>
      <UButton
        icon="i-heroicons-arrows-pointing-out"
        variant="ghost"
        @click="fitView"
      >
        适应视图
      </UButton>
      <UButton
        icon="i-heroicons-adjustments-horizontal"
        variant="ghost"
        @click="applyAutoLayout"
        :loading="isLayouting"
      >
        自动布局
      </UButton>
      <UButton
        icon="i-heroicons-plus-circle"
        variant="outline"
        @click="showAddNodeDialog = true"
      >
        添加节点
      </UButton>
      <UButton
        icon="i-heroicons-arrow-path"
        variant="ghost"
        @click="refreshGraph"
      >
        刷新
      </UButton>
    </div>

    <div class="graph-wrapper">
      <VueFlow
        v-model="elements"
        :default-zoom="1"
        :default-position="[0, 0]"
        @pane-ready="onPaneReady"
        @node-click="onNodeClick"
        @edge-click="onEdgeClick"
        class="vue-flow-custom"
      >
        <Background pattern-color="#aaa" gap="10" />
        <Controls />
        <MiniMap />

        <!-- 自定义节点类型 -->
        <template #node-character="props">
          <CharacterNode v-bind="props" />
        </template>

        <template #node-location="props">
          <LocationNode v-bind="props" />
        </template>

        <template #node-item="props">
          <ItemNode v-bind="props" />
        </template>

        <template #node-default="props">
          <DefaultNode v-bind="props" />
        </template>
      </VueFlow>
    </div>

    <!-- 添加节点对话框 -->
    <UModal v-model="showAddNodeDialog">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">添加新节点</h3>
        </template>

        <UForm :state="newNodeForm" @submit="addNewNode" class="space-y-4">
          <UFormGroup label="节点ID" name="id" required>
            <UInput v-model="newNodeForm.id" placeholder="输入唯一ID" />
          </UFormGroup>

          <UFormGroup label="标签" name="label" required>
            <UInput v-model="newNodeForm.label" placeholder="输入节点标签" />
          </UFormGroup>

          <UFormGroup label="类型" name="type" required>
            <USelect
              v-model="newNodeForm.type"
              :options="nodeTypeOptions"
              placeholder="选择节点类型"
            />
          </UFormGroup>

          <UFormGroup label="分类" name="category">
            <UInput v-model="newNodeForm.category" placeholder="输入节点分类" />
          </UFormGroup>

          <UFormGroup label="X坐标" name="x">
            <UInput v-model.number="newNodeForm.position.x" type="number" />
          </UFormGroup>

          <UFormGroup label="Y坐标" name="y">
            <UInput v-model.number="newNodeForm.position.y" type="number" />
          </UFormGroup>

          <template #footer>
            <div class="flex justify-end space-x-3">
              <UButton type="button" color="neutral" @click="showAddNodeDialog = false">
                取消
              </UButton>
              <UButton type="submit" color="primary">
                添加节点
              </UButton>
            </div>
          </template>
        </UForm>
      </UCard>
    </UModal>

    <!-- 节点详情侧边栏 -->
    <div v-if="selectedNode" class="sidebar">
      <div class="sidebar-header">
        <h3>{{ selectedNode.label }}</h3>
        <UButton
          icon="i-heroicons-x-mark"
          variant="ghost"
          size="sm"
          @click="selectedNode = null"
        />
      </div>

      <div class="sidebar-content">
        <div class="property-group">
          <h4>基本信息</h4>
          <UFormGroup label="ID">
            <span>{{ selectedNode.id }}</span>
          </UFormGroup>
          <UFormGroup label="类型">
            <span>{{ selectedNode.type }}</span>
          </UFormGroup>
          <UFormGroup label="分类">
            <span>{{ selectedNode.category || '未分类' }}</span>
          </UFormGroup>
        </div>

        <div class="property-group">
          <h4>自定义属性</h4>
          <div v-for="(value, key) in selectedNode.properties" :key="key" class="property-item">
            <label>{{ key }}:</label>
            <span>{{ value }}</span>
          </div>
          <UButton
            icon="i-heroicons-plus"
            variant="outline"
            size="sm"
            @click="addPropertyToSelectedNode"
          >
            添加属性
          </UButton>
        </div>

        <div class="actions">
          <UButton
            icon="i-heroicons-pencil-square"
            variant="outline"
            @click="editSelectedNode"
          >
            编辑
          </UButton>
          <UButton
            icon="i-heroicons-trash"
            variant="outline"
            color="red"
            @click="deleteSelectedNode"
          >
            删除
          </UButton>
        </div>
      </div>
    </div>

    <!-- 关系详情侧边栏 -->
    <div v-if="selectedEdge" class="sidebar">
      <div class="sidebar-header">
        <h3>关系详情</h3>
        <UButton
          icon="i-heroicons-x-mark"
          variant="ghost"
          size="sm"
          @click="selectedEdge = null"
        />
      </div>

      <div class="sidebar-content">
        <div class="property-group">
          <h4>关系信息</h4>
          <UFormGroup label="ID">
            <span>{{ selectedEdge.id }}</span>
          </UFormGroup>
          <UFormGroup label="源节点">
            <span>{{ selectedEdge.source }}</span>
          </UFormGroup>
          <UFormGroup label="目标节点">
            <span>{{ selectedEdge.target }}</span>
          </UFormGroup>
          <UFormGroup label="关系类型">
            <span>{{ selectedEdge.relation }}</span>
          </UFormGroup>
          <UFormGroup label="权重">
            <span>{{ selectedEdge.weight }}</span>
          </UFormGroup>
        </div>

        <div class="actions">
          <UButton
            icon="i-heroicons-pencil-square"
            variant="outline"
            @click="editSelectedEdge"
          >
            编辑
          </UButton>
          <UButton
            icon="i-heroicons-trash"
            variant="outline"
            color="red"
            @click="deleteSelectedEdge"
          >
            删除
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  VueFlow,
  useVueFlow,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge
} from '@vue-flow/core'
import { Background as BackgroundComponent } from '@vue-flow/background'
import { Controls as ControlsComponent } from '@vue-flow/controls'
import { MiniMap as MiniMapComponent } from '@vue-flow/minimap'
import { useEntityGraph } from '~/composables/useEntityGraph'
import { useEntityStore } from '~/stores/entities'
import type { EntityNode, EntityEdge } from '~/types/entity'

defineOptions({
  name: 'EntityGraph'
})

const {
  fitView,
  onPaneReady,
  addNodes,
  addEdges,
  removeNodes,
  removeEdges,
  setInteractive
} = useVueFlow()

const entityStore = useEntityStore()
const {
  applyAutoLayout,
  isLayouting,
  getNodeNeighbors,
  areNodesConnected,
  highlightNodeAndConnections
} = useEntityGraph()

// 响应式数据
const elements = ref<Node | Edge[]>([])
const selectedNode = ref<EntityNode | null>(null)
const selectedEdge = ref<EntityEdge | null>(null)
const showAddNodeDialog = ref(false)
const newNodeForm = ref({
  id: '',
  label: '',
  type: 'character' as const,
  category: '',
  position: { x: 0, y: 0 }
})

// 计算属性
const nodeTypeOptions = [
  { label: '角色', value: 'character' },
  { label: '地点', value: 'location' },
  { label: '物品', value: 'item' },
  { label: '组织', value: 'organization' },
  { label: '事件', value: 'event' }
]

// 方法
const refreshGraph = async () => {
  try {
    await entityStore.loadGraphData()
    updateElements()
  } catch (error) {
    console.error('Failed to refresh graph:', error)
    // TODO: 显示错误消息
  }
}

const updateElements = () => {
  // 清空现有元素
  elements.value = []

  // 添加节点
  entityStore.getAllNodes.forEach(node => {
    elements.value.push({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.label,
        ...node.properties
      },
      sourcePosition: 'right' as const,
      targetPosition: 'left' as const
    })
  })

  // 添加边
  entityStore.getAllEdges.forEach(edge => {
    elements.value.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.relation,
      data: {
        weight: edge.weight,
        ...edge.properties
      },
      animated: true
    })
  })
}

const onNodeClick = (event: any, node: Node) => {
  const entityNode = entityStore.getNodeById(node.id)
  if (entityNode) {
    selectedNode.value = entityNode
    selectedEdge.value = null
  }
}

const onEdgeClick = (event: any, edge: Edge) => {
  const entityEdge = entityStore.getEdgeById(edge.id)
  if (entityEdge) {
    selectedEdge.value = entityEdge
    selectedNode.value = null
  }
}

const addNewNode = async () => {
  try {
    const newNode: EntityNode = {
      id: newNodeForm.value.id,
      type: newNodeForm.value.type,
      label: newNodeForm.value.label,
      properties: {},
      position: {
        x: newNodeForm.value.position.x || Math.random() * 400,
        y: newNodeForm.value.position.y || Math.random() * 300
      },
      category: newNodeForm.value.category,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await entityStore.addNode(newNode)
    updateElements()

    // 重置表单并关闭对话框
    newNodeForm.value = {
      id: '',
      label: '',
      type: 'character',
      category: '',
      position: { x: 0, y: 0 }
    }
    showAddNodeDialog.value = false
  } catch (error) {
    console.error('Failed to add node:', error)
    // TODO: 显示错误消息
  }
}

const deleteSelectedNode = async () => {
  if (!selectedNode.value) return

  if (confirm(`确定要删除节点 "${selectedNode.value.label}" 吗？这将同时删除相关的所有关系。`)) {
    try {
      await entityStore.removeNode(selectedNode.value.id)
      selectedNode.value = null
      updateElements()
    } catch (error) {
      console.error('Failed to delete node:', error)
      // TODO: 显示错误消息
    }
  }
}

const deleteSelectedEdge = async () => {
  if (!selectedEdge.value) return

  if (confirm(`确定要删除关系 "${selectedEdge.value.relation}" 吗？`)) {
    try {
      await entityStore.removeEdge(selectedEdge.value.id)
      selectedEdge.value = null
      updateElements()
    } catch (error) {
      console.error('Failed to delete edge:', error)
      // TODO: 显示错误消息
    }
  }
}

const enableSearch = () => {
  // TODO: 实现节点搜索功能
  alert('搜索功能即将推出')
}

// 初始化
onMounted(async () => {
  await refreshGraph()
})
</script>

<style scoped>
.entity-graph-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.graph-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
  z-index: 10;
}

.graph-wrapper {
  flex: 1;
  min-height: 0;
}

.vue-flow-custom {
  flex: 1;
}

.sidebar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  background: white;
  border-left: 1px solid #e5e7eb;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.property-group {
  margin-bottom: 1.5rem;
}

.property-group h4 {
  margin-bottom: 0.75rem;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.25rem;
}

.property-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.property-item label {
  font-weight: 500;
  color: #6b7280;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>
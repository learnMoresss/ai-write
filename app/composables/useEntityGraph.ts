// composables/useEntityGraph.ts
import { ref, computed } from 'vue'
import { EntityNode, EntityEdge } from '~/types/entity'
import { useEntitiesStore } from '~/stores/entities'

export function useEntityGraph() {
  const entitiesStore = useEntitiesStore()

  // 计算属性：获取所有人物节点
  const characterNodes = computed(() => {
    return entitiesStore.getNodesByType('character')
  })

  // 计算属性：获取所有地点节点
  const locationNodes = computed(() => {
    return entitiesStore.getNodesByType('location')
  })

  // 计算属性：获取所有物品节点
  const itemNodes = computed(() => {
    return entitiesStore.getNodesByType('item')
  })

  // 计算属性：获取所有组织节点
  const organizationNodes = computed(() => {
    return entitiesStore.getNodesByType('organization')
  })

  // 获取指定节点的关联节点
  function getRelatedNodes(nodeId: string) {
    return entitiesStore.getRelatedNodes(nodeId)
  }

  // 添加新节点
  function addNode(nodeData: Omit<EntityNode, 'id'>) {
    const newNode: EntityNode = {
      ...nodeData,
      id: crypto.randomUUID(),
    }

    entitiesStore.addNode(newNode)
    return newNode
  }

  // 更新节点
  function updateNode(id: string, data: Partial<EntityNode>) {
    entitiesStore.updateNode(id, data)
  }

  // 删除节点
  function deleteNode(id: string) {
    entitiesStore.deleteNode(id)
  }

  // 添加新边
  function addEdge(edgeData: Omit<EntityEdge, 'id'>) {
    const newEdge: EntityEdge = {
      ...edgeData,
      id: crypto.randomUUID(),
    }

    entitiesStore.addEdge(newEdge)
    return newEdge
  }

  // 更新边
  function updateEdge(id: string, data: Partial<EntityEdge>) {
    entitiesStore.updateEdge(id, data)
  }

  // 删除边
  function deleteEdge(id: string) {
    entitiesStore.deleteEdge(id)
  }

  // 获取两个节点之间的边
  function getEdgeBetween(sourceId: string, targetId: string) {
    return entitiesStore.edges.find(
      edge => (edge.source === sourceId && edge.target === targetId) ||
              (edge.source === targetId && edge.target === sourceId)
    )
  }

  // 获取节点的传入边
  function getIncomingEdges(nodeId: string) {
    return entitiesStore.edges.filter(edge => edge.target === nodeId)
  }

  // 获取节点的传出边
  function getOutgoingEdges(nodeId: string) {
    return entitiesStore.edges.filter(edge => edge.source === nodeId)
  }

  // 根据关系类型查找边
  function getEdgesByRelation(relationType: string) {
    return entitiesStore.edges.filter(edge => edge.data.relation === relationType)
  }

  // 查找最短路径（简单实现）
  function findShortestPath(startId: string, endId: string): string[] {
    // 使用广度优先搜索查找最短路径
    const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }]
    const visited = new Set<string>([startId])

    while (queue.length > 0) {
      const { id, path } = queue.shift()!

      if (id === endId) {
        return path
      }

      const relatedNodes = getRelatedNodes(id)
      for (const neighborId of relatedNodes) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          queue.push({
            id: neighborId,
            path: [...path, neighborId]
          })
        }
      }
    }

    return [] // 没有找到路径
  }

  // 高亮与指定节点相关的关系
  function highlightRelatedNodes(nodeId: string) {
    const relatedNodeIds = getRelatedNodes(nodeId)
    return [nodeId, ...relatedNodeIds]
  }

  return {
    // Computed properties
    characterNodes,
    locationNodes,
    itemNodes,
    organizationNodes,

    // Methods
    getRelatedNodes,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    updateEdge,
    deleteEdge,
    getEdgeBetween,
    getIncomingEdges,
    getOutgoingEdges,
    getEdgesByRelation,
    findShortestPath,
    highlightRelatedNodes,
  }
}
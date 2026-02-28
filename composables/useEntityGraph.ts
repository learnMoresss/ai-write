// composables/useEntityGraph.ts
import { ref, reactive } from 'vue'
import type { EntityNode, EntityEdge, LinkMap } from '~/types/entity'
import { useEntityStore } from '~/stores/entities'

export function useEntityGraph() {
  const entityStore = useEntityStore()
  const isLayouting = ref(false)

  // 自动布局功能 - 使用dagre算法
  const applyAutoLayout = (direction: 'TB' | 'LR' = 'TB') => {
    isLayouting.value = true

    try {
      // 这里我们简单地将节点按某种规律排列
      // 在实际实现中，可以引入dagre库来实现更复杂的自动布局
      const nodes = [...entityStore.getAllNodes]

      // 计算网格布局
      const cols = Math.ceil(Math.sqrt(nodes.length))
      const spacing = 200

      nodes.forEach((node, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols

        entityStore.updateNode(node.id, {
          position: {
            x: col * spacing + 100,
            y: row * spacing + 100
          }
        })
      })
    } catch (error) {
      console.error('Error applying auto layout:', error)
    } finally {
      isLayouting.value = false
    }
  }

  // 查找最短路径（BFS算法）
  const findShortestPath = (startNodeId: string, endNodeId: string) => {
    const queue: string[] = [startNodeId]
    const visited = new Set<string>([startNodeId])
    const predecessors = new Map<string, string>()

    while (queue.length > 0) {
      const currentId = queue.shift()!

      if (currentId === endNodeId) {
        // 构建路径
        const path: string[] = [endNodeId]
        let current = endNodeId
        while (predecessors.has(current)) {
          current = predecessors.get(current)!
          path.unshift(current)
        }
        return path
      }

      // 获取相邻节点
      const connections = entityStore.getNodeConnections(currentId)
      const neighbors = [...connections.incoming.map(e => e.source), ...connections.outgoing.map(e => e.target)]

      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          predecessors.set(neighborId, currentId)
          queue.push(neighborId)
        }
      }
    }

    return null // 没有找到路径
  }

  // 计算节点中心性（度中心性）
  const calculateCentrality = () => {
    const centralities: Record<string, number> = {}

    for (const node of entityStore.getAllNodes) {
      centralities[node.id] = entityStore.getNodeDegree(node.id)
    }

    return centralities
  }

  // 获取连接的组件
  const getConnectedComponent = (nodeId: string) => {
    const visited = new Set<string>()
    const queue: string[] = [nodeId]
    visited.add(nodeId)

    while (queue.length > 0) {
      const currentId = queue.shift()!

      const connections = entityStore.getNodeConnections(currentId)
      const neighbors = [...connections.incoming.map(e => e.source), ...connections.outgoing.map(e => e.target)]

      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          queue.push(neighborId)
        }
      }
    }

    return Array.from(visited)
  }

  // 过滤节点
  const filterNodes = (predicate: (node: EntityNode) => boolean) => {
    return entityStore.getAllNodes.filter(predicate)
  }

  // 过滤边
  const filterEdges = (predicate: (edge: EntityEdge) => boolean) => {
    return entityStore.getAllEdges.filter(predicate)
  }

  // 获取节点的邻居
  const getNodeNeighbors = (nodeId: string) => {
    const connections = entityStore.getNodeConnections(nodeId)
    return {
      incoming: connections.incoming.map(edge => entityStore.getNodeById(edge.source)).filter(Boolean) as EntityNode[],
      outgoing: connections.outgoing.map(edge => entityStore.getNodeById(edge.target)).filter(Boolean) as EntityNode[],
      all: [
        ...connections.incoming.map(edge => entityStore.getNodeById(edge.source)),
        ...connections.outgoing.map(edge => entityStore.getNodeById(edge.target))
      ].filter(Boolean) as EntityNode[]
    }
  }

  // 检查两个节点之间是否有直接连接
  const areNodesConnected = (nodeId1: string, nodeId2: string) => {
    return entityStore.getAllEdges.some(edge =>
      (edge.source === nodeId1 && edge.target === nodeId2) ||
      (edge.source === nodeId2 && edge.target === nodeId1)
    )
  }

  // 获取子图
  const getSubgraph = (nodeIds: string[]): LinkMap => {
    const nodes = nodeIds.map(id => entityStore.getNodeById(id)).filter(Boolean) as EntityNode[]
    const edges = entityStore.getAllEdges.filter(edge =>
      nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
    )

    return {
      nodes,
      edges
    }
  }

  // 高亮节点和连接
  const highlightNodeAndConnections = (nodeId: string, highlightDistance: number = 1) => {
    const nodesToHighlight: string[] = [nodeId]
    const edgesToHighlight: string[] = []

    if (highlightDistance >= 1) {
      const connections = entityStore.getNodeConnections(nodeId)
      edgesToHighlight.push(...connections.all.map(e => e.id))
      nodesToHighlight.push(...connections.all.map(e => e.source !== nodeId ? e.source : e.target))
    }

    if (highlightDistance >= 2) {
      // 添加第二层连接
      for (const neighborId of [...nodesToHighlight]) {
        const connections = entityStore.getNodeConnections(neighborId)
        edgesToHighlight.push(...connections.all.filter(e => !edgesToHighlight.includes(e.id)).map(e => e.id))
        nodesToHighlight.push(...connections.all
          .map(e => e.source !== neighborId ? e.source : e.target)
          .filter(id => !nodesToHighlight.includes(id))
        )
      }
    }

    return {
      highlightedNodes: nodesToHighlight,
      highlightedEdges: edgesToHighlight
    }
  }

  // 导出图谱数据
  const exportGraphData = (format: 'json' | 'csv' | 'dot' = 'json'): any => {
    const linkMap = entityStore.exportLinkMap()

    switch (format) {
      case 'json':
        return JSON.stringify(linkMap, null, 2)
      case 'csv':
        // CSV格式的节点数据
        const nodesCsv = [
          ['id', 'label', 'type', 'category', 'x', 'y'],
          ...linkMap.nodes.map(node => [
            node.id,
            node.label,
            node.type,
            node.category || '',
            node.position.x,
            node.position.y
          ])
        ].map(row => row.join(',')).join('\n')

        // CSV格式的边数据
        const edgesCsv = [
          ['id', 'source', 'target', 'relation', 'weight'],
          ...linkMap.edges.map(edge => [
            edge.id,
            edge.source,
            edge.target,
            edge.relation,
            edge.weight
          ])
        ].map(row => row.join(',')).join('\n')

        return { nodes: nodesCsv, edges: edgesCsv }
      case 'dot':
        // DOT格式，适用于Graphviz
        let dot = 'digraph {\n'
        dot += '  rankdir=TB;\n'
        dot += '  node [shape=box];\n\n'

        for (const node of linkMap.nodes) {
          dot += `  "${node.id}" [label="${node.label} (${node.type})"];\n`
        }

        dot += '\n'

        for (const edge of linkMap.edges) {
          dot += `  "${edge.source}" -> "${edge.target}" [label="${edge.relation}", weight=${edge.weight}];\n`
        }

        dot += '}\n'
        return dot
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  // 导入图谱数据
  const importGraphData = (data: LinkMap) => {
    entityStore.setLinkMap(data)
  }

  // 计算图统计信息
  const getGraphStats = () => {
    const nodesCount = entityStore.getAllNodes.length
    const edgesCount = entityStore.getAllEdges.length

    // 平均度数
    const avgDegree = nodesCount > 0 ? (edgesCount * 2) / nodesCount : 0

    // 密度（对于无向图的简化计算）
    const density = nodesCount > 1 ? (2 * edgesCount) / (nodesCount * (nodesCount - 1)) : 0

    // 连通分量数量
    const visited = new Set<string>()
    let components = 0

    for (const node of entityStore.getAllNodes) {
      if (!visited.has(node.id)) {
        // BFS遍历连通分量
        const queue = [node.id]
        visited.add(node.id)

        while (queue.length > 0) {
          const currentId = queue.shift()!
          const connections = entityStore.getNodeConnections(currentId)

          const neighbors = [
            ...connections.incoming.map(e => e.source),
            ...connections.outgoing.map(e => e.target)
          ]

          for (const neighborId of neighbors) {
            if (!visited.has(neighborId)) {
              visited.add(neighborId)
              queue.push(neighborId)
            }
          }
        }

        components++
      }
    }

    return {
      nodesCount,
      edgesCount,
      avgDegree,
      density,
      components,
      isConnected: components === 1
    }
  }

  return {
    // 状态
    isLayouting,

    // 方法
    applyAutoLayout,
    findShortestPath,
    calculateCentrality,
    getConnectedComponent,
    filterNodes,
    filterEdges,
    getNodeNeighbors,
    areNodesConnected,
    getSubgraph,
    highlightNodeAndConnections,
    exportGraphData,
    importGraphData,
    getGraphStats
  }
}
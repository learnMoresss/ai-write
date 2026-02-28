// stores/entities.ts
import { defineStore } from 'pinia'
import type { EntityNode, EntityEdge, LinkMap } from '~/types/entity'

export const useEntityStore = defineStore('entities', {
  state: () => ({
    nodes: [] as EntityNode[],
    edges: [] as EntityEdge[],
    selectedNode: null as EntityNode | null,
    selectedEdge: null as EntityEdge | null,
    filteredNodes: [] as EntityNode[],
    filteredEdges: [] as EntityEdge[],
    searchTerm: '',
    nodeTypesFilter: [] as string[],
    isLoading: false,
  }),

  getters: {
    getAllNodes: (state) => state.nodes,
    getAllEdges: (state) => state.edges,
    getSelectedNode: (state) => state.selectedNode,
    getSelectedEdge: (state) => state.selectedEdge,
    getFilteredNodes: (state) => state.filteredNodes,
    getFilteredEdges: (state) => state.filteredEdges,
    getIsLoading: (state) => state.isLoading,

    // 根据ID获取节点
    getNodeById: (state) => (id: string) => {
      return state.nodes.find(node => node.id === id)
    },

    // 根据ID获取边
    getEdgeById: (state) => (id: string) => {
      return state.edges.find(edge => edge.id === id)
    },

    // 获取节点的相邻节点
    getAdjacentNodes: (state) => (nodeId: string) => {
      const connectedEdges = state.edges.filter(edge =>
        edge.source === nodeId || edge.target === nodeId
      )

      return connectedEdges.map(edge =>
        edge.source === nodeId ? edge.target : edge.source
      ).map(id => state.nodes.find(node => node.id === id)).filter(Boolean) as EntityNode[]
    },

    // 获取特定类型的节点
    getNodesByType: (state) => (type: string) => {
      return state.nodes.filter(node => node.type === type)
    },

    // 获取节点的传入边
    getIncomingEdges: (state) => (nodeId: string) => {
      return state.edges.filter(edge => edge.target === nodeId)
    },

    // 获取节点的传出边
    getOutgoingEdges: (state) => (nodeId: string) => {
      return state.edges.filter(edge => edge.source === nodeId)
    },

    // 获取节点的连接关系
    getNodeConnections: (state) => (nodeId: string) => {
      const incoming = state.edges.filter(edge => edge.target === nodeId)
      const outgoing = state.edges.filter(edge => edge.source === nodeId)

      return {
        incoming,
        outgoing,
        all: [...incoming, ...outgoing]
      }
    },

    // 计算节点度数
    getNodeDegree: (state) => (nodeId: string) => {
      return state.edges.filter(edge =>
        edge.source === nodeId || edge.target === nodeId
      ).length
    },
  },

  actions: {
    // 设置节点列表
    setNodes(nodes: EntityNode[]) {
      this.nodes = nodes
      this.applyFilters()
    },

    // 设置边列表
    setEdges(edges: EntityEdge[]) {
      this.edges = edges
      this.applyFilters()
    },

    // 添加节点
    async addNode(node: EntityNode) {
      // 检查节点ID是否已存在
      if (this.nodes.some(n => n.id === node.id)) {
        console.warn(`Node with ID ${node.id} already exists`)
        return
      }

      this.nodes.push(node)
      this.applyFilters()

      // 如果需要，可以在这里调用API保存到后端
      try {
        await $fetch('/api/graph/entities', {
          method: 'POST',
          body: node
        })
      } catch (error) {
        console.error('Failed to save node to backend:', error)
        // 从本地移除，因为保存失败
        this.nodes = this.nodes.filter(n => n.id !== node.id)
        throw error
      }
    },

    // 更新节点
    async updateNode(id: string, updates: Partial<EntityNode>) {
      const index = this.nodes.findIndex(node => node.id === id)
      if (index === -1) return

      const oldNode = { ...this.nodes[index] }
      this.nodes[index] = { ...this.nodes[index], ...updates, updatedAt: new Date() }
      this.applyFilters()

      // 调用API更新后端
      try {
        await $fetch(`/api/graph/entities/${id}`, {
          method: 'PUT',
          body: this.nodes[index]
        })
      } catch (error) {
        console.error('Failed to update node in backend:', error)
        // 恢复旧值，因为保存失败
        this.nodes[index] = oldNode
        throw error
      }
    },

    // 删除节点
    async removeNode(id: string) {
      const node = this.nodes.find(n => n.id === id)
      if (!node) return

      // 先移除相关的边
      const relatedEdges = this.edges.filter(edge =>
        edge.source === id || edge.target === id
      )

      // 从后端删除相关边
      for (const edge of relatedEdges) {
        try {
          await $fetch(`/api/graph/relations/${edge.id}`, {
            method: 'DELETE'
          })
        } catch (error) {
          console.error(`Failed to delete edge ${edge.id} from backend:`, error)
        }
      }

      // 从后端删除节点
      try {
        await $fetch(`/api/graph/entities/${id}`, {
          method: 'DELETE'
        })

        // 成功删除后，从本地移除
        this.nodes = this.nodes.filter(node => node.id !== id)
        this.edges = this.edges.filter(edge =>
          edge.source !== id && edge.target !== id
        )
        this.applyFilters()

        if (this.selectedNode?.id === id) {
          this.selectedNode = null
        }
      } catch (error) {
        console.error(`Failed to delete node ${id} from backend:`, error)
        throw error
      }
    },

    // 添加边
    async addEdge(edge: EntityEdge) {
      // 检查边ID是否已存在
      if (this.edges.some(e => e.id === edge.id)) {
        console.warn(`Edge with ID ${edge.id} already exists`)
        return
      }

      // 检查源节点和目标节点是否存在
      if (!this.nodes.some(n => n.id === edge.source)) {
        throw new Error(`Source node ${edge.source} does not exist`)
      }
      if (!this.nodes.some(n => n.id === edge.target)) {
        throw new Error(`Target node ${edge.target} does not exist`)
      }

      this.edges.push(edge)
      this.applyFilters()

      // 调用API保存到后端
      try {
        await $fetch('/api/graph/relations', {
          method: 'POST',
          body: edge
        })
      } catch (error) {
        console.error('Failed to save edge to backend:', error)
        // 从本地移除，因为保存失败
        this.edges = this.edges.filter(e => e.id !== edge.id)
        throw error
      }
    },

    // 更新边
    async updateEdge(id: string, updates: Partial<EntityEdge>) {
      const index = this.edges.findIndex(edge => edge.id === id)
      if (index === -1) return

      const oldEdge = { ...this.edges[index] }
      this.edges[index] = { ...this.edges[index], ...updates, updatedAt: new Date() }
      this.applyFilters()

      // 调用API更新后端
      try {
        await $fetch(`/api/graph/relations/${id}`, {
          method: 'PUT',
          body: this.edges[index]
        })
      } catch (error) {
        console.error('Failed to update edge in backend:', error)
        // 恢复旧值，因为保存失败
        this.edges[index] = oldEdge
        throw error
      }
    },

    // 删除边
    async removeEdge(id: string) {
      const edge = this.edges.find(e => e.id === id)
      if (!edge) return

      try {
        await $fetch(`/api/graph/relations/${id}`, {
          method: 'DELETE'
        })

        // 成功删除后，从本地移除
        this.edges = this.edges.filter(edge => edge.id !== id)
        this.applyFilters()

        if (this.selectedEdge?.id === id) {
          this.selectedEdge = null
        }
      } catch (error) {
        console.error(`Failed to delete edge ${id} from backend:`, error)
        throw error
      }
    },

    // 设置选中的节点
    setSelectedNode(node: EntityNode | null) {
      this.selectedNode = node
    },

    // 设置选中的边
    setSelectedEdge(edge: EntityEdge | null) {
      this.selectedEdge = edge
    },

    // 批量设置数据
    async setLinkMap(linkMap: LinkMap) {
      this.isLoading = true
      try {
        // 先清空现有数据
        this.nodes = []
        this.edges = []

        // 添加新节点
        for (const node of linkMap.nodes) {
          await this.addNode(node)
        }

        // 添加新边
        for (const edge of linkMap.edges) {
          await this.addEdge(edge)
        }
      } catch (error) {
        console.error('Failed to set link map:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 导出为LinkMap格式
    exportLinkMap(): LinkMap {
      return {
        nodes: [...this.nodes],
        edges: [...this.edges]
      }
    },

    // 应用过滤器
    applyFilters() {
      let filteredNodes = this.nodes
      let filteredEdges = this.edges

      // 应用搜索过滤
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filteredNodes = filteredNodes.filter(node =>
          node.label.toLowerCase().includes(term) ||
          node.properties?.name?.toLowerCase().includes(term) ||
          node.category?.toLowerCase().includes(term)
        )

        // 只保留连接到过滤后节点的边
        const nodeIds = new Set(filteredNodes.map(node => node.id))
        filteredEdges = filteredEdges.filter(edge =>
          nodeIds.has(edge.source) && nodeIds.has(edge.target)
        )
      }

      // 应用类型过滤
      if (this.nodeTypesFilter.length > 0) {
        filteredNodes = filteredNodes.filter(node =>
          this.nodeTypesFilter.includes(node.type)
        )

        // 只保留连接到过滤后节点的边
        const nodeIds = new Set(filteredNodes.map(node => node.id))
        filteredEdges = filteredEdges.filter(edge =>
          nodeIds.has(edge.source) && nodeIds.has(edge.target)
        )
      }

      this.filteredNodes = filteredNodes
      this.filteredEdges = filteredEdges
    },

    // 设置搜索词
    setSearchTerm(term: string) {
      this.searchTerm = term
      this.applyFilters()
    },

    // 设置类型过滤
    setNodeTypesFilter(types: string[]) {
      this.nodeTypesFilter = types
      this.applyFilters()
    },

    // 清除所有过滤器
    clearFilters() {
      this.searchTerm = ''
      this.nodeTypesFilter = []
      this.applyFilters()
    },

    // 加载图谱数据
    async loadGraphData() {
      this.isLoading = true
      try {
        const response = await $fetch('/api/graph/entities')
        const { nodes, edges } = response.data

        this.nodes = nodes
        this.edges = edges
        this.applyFilters()
      } catch (error) {
        console.error('Failed to load graph data:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 重置状态
    reset() {
      this.nodes = []
      this.edges = []
      this.selectedNode = null
      this.selectedEdge = null
      this.filteredNodes = []
      this.filteredEdges = []
      this.searchTerm = ''
      this.nodeTypesFilter = []
    }
  },
})
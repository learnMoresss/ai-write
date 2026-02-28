import { defineStore } from 'pinia'
import { Node, Edge } from '@vue-flow/core'

export interface EntityNode extends Node {
  id: string
  type: 'character' | 'location' | 'item' | 'organization'
  position: { x: number; y: number }
  data: {
    label: string
    name: string
    type: 'character' | 'location' | 'item' | 'organization'
    properties: Record<string, any> // 战力、等级、描述等
    description?: string
  }
}

export interface EntityEdge extends Edge {
  id: string
  source: string
  target: string
  type: string
  data: {
    relation: string // "师徒", "仇敌", "恋人"
    weight: number   // 关系强度
    description?: string
  }
}

export const useEntitiesStore = defineStore('entities', {
  state: () => ({
    nodes: [] as EntityNode[],
    edges: [] as EntityEdge[],
    selectedNodeId: null as string | null,
    selectedEdgeId: null as string | null,
  }),

  getters: {
    getNodes(): EntityNode[] {
      return this.nodes
    },
    getEdges(): EntityEdge[] {
      return this.edges
    },
    getSelectedNode(): EntityNode | undefined {
      if (!this.selectedNodeId) return undefined
      return this.nodes.find(node => node.id === this.selectedNodeId)
    },
    getSelectedEdge(): EntityEdge | undefined {
      if (!this.selectedEdgeId) return undefined
      return this.edges.find(edge => edge.id === this.selectedEdgeId)
    },
    getNodeById: (state) => (id: string) => {
      return state.nodes.find(node => node.id === id)
    },
    getRelatedNodes: (state) => (nodeId: string) => {
      const connectedEdges = state.edges.filter(
        edge => edge.source === nodeId || edge.target === nodeId
      )
      return connectedEdges.map(edge =>
        edge.source === nodeId ? edge.target : edge.source
      )
    }
  },

  actions: {
    addNode(node: EntityNode) {
      this.nodes.push(node)
    },

    updateNode(id: string, data: Partial<EntityNode>) {
      const index = this.nodes.findIndex(node => node.id === id)
      if (index !== -1) {
        Object.assign(this.nodes[index], data)
      }
    },

    deleteNode(id: string) {
      // 删除节点及其相关联的边
      this.nodes = this.nodes.filter(node => node.id !== id)
      this.edges = this.edges.filter(edge => edge.source !== id && edge.target !== id)

      if (this.selectedNodeId === id) {
        this.selectedNodeId = null
      }
    },

    addEdge(edge: EntityEdge) {
      this.edges.push(edge)
    },

    updateEdge(id: string, data: Partial<EntityEdge>) {
      const index = this.edges.findIndex(edge => edge.id === id)
      if (index !== -1) {
        Object.assign(this.edges[index], data)
      }
    },

    deleteEdge(id: string) {
      this.edges = this.edges.filter(edge => edge.id !== id)

      if (this.selectedEdgeId === id) {
        this.selectedEdgeId = null
      }
    },

    setSelectedNode(id: string | null) {
      this.selectedNodeId = id
      this.selectedEdgeId = null // 清除选中的边
    },

    setSelectedEdge(id: string | null) {
      this.selectedEdgeId = id
      this.selectedNodeId = null // 清除选中的节点
    },

    clearSelection() {
      this.selectedNodeId = null
      this.selectedEdgeId = null
    },

    // 根据类型筛选节点
    getNodesByType(type: 'character' | 'location' | 'item' | 'organization') {
      return this.nodes.filter(node => node.data.type === type)
    }
  }
})
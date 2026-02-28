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

export interface Entity {
  id: string
  name: string
  type: 'character' | 'location' | 'item' | 'organization'
  description?: string
  properties: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Relationship {
  id: string
  sourceEntityId: string
  targetEntityId: string
  type: string // 如："friend", "enemy", "mentor", "romantic"
  strength: number // 关系强度，范围 -1 到 1
  description?: string
  createdAt: Date
  updatedAt: Date
}
// utils/formatters.ts
import { EntityNode, EntityEdge } from '~/types/entity'
import { Story } from '~/types/story'

export const formatEntityNode = (node: EntityNode): any => {
  return {
    id: node.id,
    label: node.label,
    type: node.type,
    properties: node.properties,
    position: node.position,
    category: node.category,
    createdAt: node.createdAt.toISOString(),
    updatedAt: node.updatedAt.toISOString()
  }
}

export const formatEntityEdge = (edge: EntityEdge): any => {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    relation: edge.relation,
    weight: edge.weight,
    properties: edge.properties,
    createdAt: edge.createdAt.toISOString(),
    updatedAt: edge.updatedAt.toISOString()
  }
}

export const formatStory = (story: Story): any => {
  return {
    id: story.id,
    title: story.title,
    description: story.description,
    worldSetting: {
      ...story.worldSetting,
      createdAt: story.worldSetting.createdAt.toISOString(),
      updatedAt: story.worldSetting.updatedAt.toISOString()
    },
    entities: story.entities.map(formatEntityNode),
    relationships: story.relationships.map(formatEntityEdge),
    plotEvents: story.plotEvents,
    timeline: story.timeline,
    triggers: story.triggers,
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString(),
    status: story.status
  }
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1048576) {
    return (bytes / 1024).toFixed(1) + ' KB'
  } else {
    return (bytes / 1048576).toFixed(1) + ' MB'
  }
}

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const camelCaseToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

export const sanitizeHtml = (html: string): string => {
  // 简单的HTML清理，移除潜在危险的标签和属性
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
}

export const escapeHtml = (html: string): string => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}
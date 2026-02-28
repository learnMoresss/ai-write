// utils/validators.ts
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password: string): boolean => {
  // 至少8个字符，包含大小写字母和数字
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return re.test(password)
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateJson = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export const validateEntityNode = (node: any): boolean => {
  if (!node || typeof node !== 'object') return false

  // 检查必需字段
  if (!node.id || typeof node.id !== 'string') return false
  if (!node.label || typeof node.label !== 'string') return false
  if (!node.type || typeof node.type !== 'string') return false

  // 检查位置信息
  if (!node.position || typeof node.position !== 'object') return false
  if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') return false

  return true
}

export const validateEntityEdge = (edge: any): boolean => {
  if (!edge || typeof edge !== 'object') return false

  // 检查必需字段
  if (!edge.id || typeof edge.id !== 'string') return false
  if (!edge.source || typeof edge.source !== 'string') return false
  if (!edge.target || typeof edge.target !== 'string') return false
  if (!edge.relation || typeof edge.relation !== 'string') return false

  // 检查权重是否为数字
  if (typeof edge.weight !== 'number') return false

  return true
}

export const validateStory = (story: any): boolean => {
  if (!story || typeof story !== 'object') return false

  // 检查必需字段
  if (!story.id || typeof story.id !== 'string') return false
  if (!story.title || typeof story.title !== 'string') return false
  if (!story.description || typeof story.description !== 'string') return false

  // 检查日期字段
  if (!story.createdAt || isNaN(new Date(story.createdAt).getTime())) return false
  if (!story.updatedAt || isNaN(new Date(story.updatedAt).getTime())) return false

  // 检查状态
  const validStatuses = ['draft', 'in-progress', 'completed', 'archived']
  if (!validStatuses.includes(story.status)) return false

  // 检查实体和关系（如果存在）
  if (story.entities && !Array.isArray(story.entities)) return false
  if (story.relationships && !Array.isArray(story.relationships)) return false

  return true
}
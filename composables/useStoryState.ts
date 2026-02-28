// composables/useStoryState.ts
import { ref, computed } from 'vue'
import type { Story, PlotEvent, TimelineEvent, Trigger } from '~/types/story'
import { useStoryStore } from '~/stores/story'
import { useEntityStore } from '~/stores/entities'
import { useTriggerStore } from '~/stores/triggers'

export function useStoryState() {
  const storyStore = useStoryStore()
  const entityStore = useEntityStore()
  const triggerStore = useTriggerStore()

  // 计算属性
  const currentStory = computed(() => storyStore.currentStory)
  const allStories = computed(() => storyStore.stories)
  const isLoading = computed(() => storyStore.isLoading)
  const isGenerating = computed(() => storyStore.isGenerating)

  // 故事操作
  const loadStories = async () => {
    return await storyStore.loadStories()
  }

  const loadStory = async (id: string) => {
    return await storyStore.loadStory(id)
  }

  const createStory = async (title: string, description?: string) => {
    return await storyStore.createStory(title, description)
  }

  const updateCurrentStory = async () => {
    return await storyStore.updateCurrentStory()
  }

  const deleteStory = async (id: string) => {
    return await storyStore.deleteStory(id)
  }

  // 世界观操作
  const updateWorldSetting = (worldSetting: any) => {
    storyStore.setWorldSetting(worldSetting)
  }

  // 实体操作
  const addEntity = (entity: any) => {
    storyStore.addEntity(entity)
  }

  const updateEntity = (id: string, updatedEntity: any) => {
    storyStore.updateEntity(id, updatedEntity)
  }

  const removeEntity = (id: string) => {
    storyStore.removeEntity(id)
  }

  // 关系操作
  const addRelationship = (relationship: any) => {
    storyStore.addRelationship(relationship)
  }

  const updateRelationship = (id: string, updatedRelationship: any) => {
    storyStore.updateRelationship(id, updatedRelationship)
  }

  const removeRelationship = (id: string) => {
    storyStore.removeRelationship(id)
  }

  // 剧情事件操作
  const addPlotEvent = (event: PlotEvent) => {
    storyStore.addPlotEvent(event)
  }

  const updatePlotEvent = (id: string, updatedEvent: Partial<PlotEvent>) => {
    storyStore.updatePlotEvent(id, updatedEvent)
  }

  // 选择操作
  const selectEvent = (event: PlotEvent | null) => {
    storyStore.setSelectedEvent(event)
  }

  const selectTimelineEvent = (event: TimelineEvent | null) => {
    storyStore.setSelectedTimelineEvent(event)
  }

  const selectTrigger = (trigger: Trigger | null) => {
    storyStore.setSelectedTrigger(trigger)
  }

  // 获取故事统计信息
  const getStoryStats = (storyId?: string) => {
    const story = storyId
      ? storyStore.getStoryById(storyId)
      : storyStore.currentStory

    if (!story) {
      return {
        entityCount: 0,
        relationshipCount: 0,
        plotEventCount: 0,
        timelineEventCount: 0,
        triggerCount: 0
      }
    }

    return {
      entityCount: story.entities.length,
      relationshipCount: story.relationships.length,
      plotEventCount: story.plotEvents.length,
      timelineEventCount: story.timeline.length,
      triggerCount: story.triggers.length
    }
  }

  // 搜索故事内容
  const searchInStory = (query: string) => {
    if (!currentStory.value) return []

    const results: any[] = []

    // 在实体中搜索
    for (const entity of currentStory.value.entities) {
      if (entity.label.toLowerCase().includes(query.toLowerCase()) ||
          JSON.stringify(entity.properties).toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'entity',
          id: entity.id,
          label: entity.label,
          content: entity,
          matchedText: '实体匹配'
        })
      }
    }

    // 在关系中搜索
    for (const relationship of currentStory.value.relationships) {
      if (relationship.relation.toLowerCase().includes(query.toLowerCase()) ||
          JSON.stringify(relationship.properties).toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'relationship',
          id: relationship.id,
          label: `${relationship.source} -> ${relationship.target} (${relationship.relation})`,
          content: relationship,
          matchedText: '关系匹配'
        })
      }
    }

    // 在剧情事件中搜索
    for (const event of currentStory.value.plotEvents) {
      if (event.name.toLowerCase().includes(query.toLowerCase()) ||
          event.description.toLowerCase().includes(query.toLowerCase()) ||
          event.content?.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'plotEvent',
          id: event.id,
          label: event.name,
          content: event,
          matchedText: '剧情事件匹配'
        })
      }
    }

    return results
  }

  // 获取故事大纲
  const getStoryOutline = () => {
    if (!currentStory.value) return []

    return currentStory.value.plotEvents
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        status: event.status,
        type: event.type
      }))
  }

  // 检查故事完整性
  const validateStoryIntegrity = () => {
    if (!currentStory.value) return { isValid: false, issues: ['没有活动的故事'] }

    const issues: string[] = []

    // 检查是否有基本设置
    if (!currentStory.value.title || currentStory.value.title.trim().length === 0) {
      issues.push('故事标题不能为空')
    }

    if (!currentStory.value.worldSetting || !currentStory.value.worldSetting.name) {
      issues.push('故事需要有世界观设置')
    }

    // 检查实体引用的有效性
    for (const relationship of currentStory.value.relationships) {
      if (!currentStory.value.entities.some(e => e.id === relationship.source)) {
        issues.push(`关系 ${relationship.id} 引用了不存在的源实体 ${relationship.source}`)
      }
      if (!currentStory.value.entities.some(e => e.id === relationship.target)) {
        issues.push(`关系 ${relationship.id} 引用了不存在的目标实体 ${relationship.target}`)
      }
    }

    // 检查剧情事件引用的有效性
    for (const event of currentStory.value.plotEvents) {
      if (event.affectedEntities) {
        for (const entityId of event.affectedEntities) {
          if (!currentStory.value.entities.some(e => e.id === entityId)) {
            issues.push(`剧情事件 ${event.id} 引用了不存在的实体 ${entityId}`)
          }
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }

  // 生成故事报告
  const generateStoryReport = () => {
    if (!currentStory.value) return null

    const stats = getStoryStats()

    return {
      title: currentStory.value.title,
      description: currentStory.value.description,
      status: currentStory.value.status,
      createdAt: currentStory.value.createdAt,
      updatedAt: currentStory.value.updatedAt,
      statistics: stats,
      integrity: validateStoryIntegrity()
    }
  }

  // 导出故事数据
  const exportStory = (format: 'json' | 'yaml' | 'text' = 'json') => {
    if (!currentStory.value) return null

    switch (format) {
      case 'json':
        return JSON.stringify(currentStory.value, null, 2)
      case 'yaml':
        // 实际实现中需要使用yaml库
        return JSON.stringify(currentStory.value, null, 2)
          .replace(/"([^"]+)":/g, '$1:')  // 移除引号
          .replace(/"/g, "'")  // 替换双引号为单引号
      case 'text':
        // 纯文本格式
        let text = `# ${currentStory.value.title}\n\n`
        text += `## 描述\n${currentStory.value.description}\n\n`
        text += `## 世界观\n${currentStory.value.worldSetting.description}\n\n`
        text += `## 实体 (${stats.entityCount})\n`
        for (const entity of currentStory.value.entities) {
          text += `- ${entity.label} (${entity.type}): ${JSON.stringify(entity.properties)}\n`
        }
        text += `\n## 关系 (${stats.relationshipCount})\n`
        for (const rel of currentStory.value.relationships) {
          text += `- ${rel.source} --[${rel.relation}]--> ${rel.target}\n`
        }
        text += `\n## 剧情事件 (${stats.plotEventCount})\n`
        for (const event of currentStory.value.plotEvents) {
          text += `- ${event.name}: ${event.description}\n`
        }
        return text
      default:
        return JSON.stringify(currentStory.value, null, 2)
    }
  }

  // 导入故事数据
  const importStory = (data: any) => {
    // 这里需要验证导入的数据结构
    storyStore.setCurrentStory(data as Story)
  }

  // 重置故事状态
  const resetStoryState = () => {
    storyStore.setCurrentStory(null)
  }

  // 触发器操作
  const evaluateTriggers = async (context: any = {}) => {
    await triggerStore.evaluateAllTriggers(context)
  }

  return {
    // 计算属性
    currentStory,
    allStories,
    isLoading,
    isGenerating,

    // 故事操作
    loadStories,
    loadStory,
    createStory,
    updateCurrentStory,
    deleteStory,

    // 设置操作
    updateWorldSetting,

    // 实体操作
    addEntity,
    updateEntity,
    removeEntity,

    // 关系操作
    addRelationship,
    updateRelationship,
    removeRelationship,

    // 剧情操作
    addPlotEvent,
    updatePlotEvent,

    // 选择操作
    selectEvent,
    selectTimelineEvent,
    selectTrigger,

    // 工具方法
    getStoryStats,
    searchInStory,
    getStoryOutline,
    validateStoryIntegrity,
    generateStoryReport,
    exportStory,
    importStory,
    resetStoryState,
    evaluateTriggers
  }
}
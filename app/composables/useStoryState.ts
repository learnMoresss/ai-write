// composables/useStoryState.ts
import { computed } from 'vue'
import { useStoryStore } from '~/stores/story'
import { useEntitiesStore } from '~/stores/entities'
import { useTriggersStore } from '~/stores/triggers'

export function useStoryState() {
  const storyStore = useStoryStore()
  const entitiesStore = useEntitiesStore()
  const triggersStore = useTriggersStore()

  // 计算属性：获取当前故事的状态
  const currentStory = computed(() => storyStore.getCurrentStory)

  // 计算属性：获取所有故事
  const allStories = computed(() => storyStore.getAllStories)

  // 计算属性：获取当前故事的实体
  const currentStoryEntities = computed(() => {
    if (!storyStore.currentStory) return []
    // 在实际实现中，这里会根据当前故事过滤实体
    return entitiesStore.getNodes()
  })

  // 计算属性：获取当前故事的触发器
  const currentStoryTriggers = computed(() => {
    if (!storyStore.currentStory) return []
    // 在实际实现中，这里会根据当前故事过滤触发器
    return triggersStore.getAllTriggers
  })

  // 计算属性：故事生成状态
  const isGenerating = computed(() => storyStore.getIsGenerating)

  // 创建新故事
  async function createNewStory(title: string, description: string) {
    return await storyStore.createStory(title, description)
  }

  // 加载指定故事
  async function loadStory(storyId: string) {
    await storyStore.loadStory(storyId)
  }

  // 保存当前故事
  async function saveCurrentStory() {
    if (storyStore.currentStory) {
      await storyStore.saveStory(storyStore.currentStory)
    }
  }

  // 删除故事
  async function deleteStory(storyId: string) {
    await storyStore.deleteStory(storyId)
  }

  // 更新故事状态
  function setStoryStatus(status: 'draft' | 'in-progress' | 'completed') {
    if (storyStore.currentStory) {
      storyStore.currentStory.status = status
      saveCurrentStory()
    }
  }

  // 获取故事统计信息
  function getStoryStats() {
    return {
      totalStories: storyStore.stories.length,
      draftCount: storyStore.stories.filter(s => s.status === 'draft').length,
      inProgressCount: storyStore.stories.filter(s => s.status === 'in-progress').length,
      completedCount: storyStore.stories.filter(s => s.status === 'completed').length,
      totalEntities: entitiesStore.nodes.length,
      totalTriggers: triggersStore.triggers.length,
    }
  }

  // 导出故事数据
  function exportStoryData(storyId?: string) {
    const story = storyId ? storyStore.stories.find(s => s.id === storyId) : storyStore.currentStory
    if (!story) return null

    return {
      story: story,
      entities: entitiesStore.getNodes(),
      triggers: triggersStore.getAllTriggers,
      exportDate: new Date().toISOString()
    }
  }

  // 导入故事数据
  function importStoryData(data: any) {
    // 实现故事数据导入逻辑
    if (data.story) {
      storyStore.saveStory(data.story)
    }

    if (data.entities) {
      entitiesStore.$patch({
        nodes: data.entities
      })
    }

    if (data.triggers) {
      // 重置触发器并导入新数据
      triggersStore.$patch({
        triggers: data.triggers
      })
      triggersStore.updateActiveTriggers()
    }
  }

  return {
    // Computed
    currentStory,
    allStories,
    currentStoryEntities,
    currentStoryTriggers,
    isGenerating,

    // Methods
    createNewStory,
    loadStory,
    saveCurrentStory,
    deleteStory,
    setStoryStatus,
    getStoryStats,
    exportStoryData,
    importStoryData
  }
}
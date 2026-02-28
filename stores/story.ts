// stores/story.ts
import { defineStore } from 'pinia'
import type { Story, WorldSetting, PlotEvent, TimelineEvent, Trigger } from '~/types/story'

export const useStoryStore = defineStore('story', {
  state: () => ({
    currentStory: null as Story | null,
    stories: [] as Story[],
    isLoading: false,
    isGenerating: false,
    generationProgress: 0,
    selectedEvent: null as PlotEvent | null,
    selectedTimelineEvent: null as TimelineEvent | null,
    selectedTrigger: null as Trigger | null,
  }),

  getters: {
    getCurrentStory: (state) => state.currentStory,
    getAllStories: (state) => state.stories,
    getIsLoading: (state) => state.isLoading,
    getIsGenerating: (state) => state.isGenerating,
    getGenerationProgress: (state) => state.generationProgress,
    getSelectedEvent: (state) => state.selectedEvent,
    getSelectedTimelineEvent: (state) => state.selectedTimelineEvent,
    getSelectedTrigger: (state) => state.selectedTrigger,

    // 根据ID获取特定故事
    getStoryById: (state) => (id: string) => {
      return state.stories.find(story => story.id === id)
    },

    // 获取当前世界的设置
    getCurrentWorldSetting: (state) => {
      if (!state.currentStory) return null
      return state.currentStory.worldSetting
    },

    // 获取当前实体列表
    getCurrentEntities: (state) => {
      if (!state.currentStory) return []
      return state.currentStory.entities || []
    },

    // 获取当前关系列表
    getCurrentRelationships: (state) => {
      if (!state.currentStory) return []
      return state.currentStory.relationships || []
    },

    // 获取当前剧情事件列表
    getCurrentPlotEvents: (state) => {
      if (!state.currentStory) return []
      return state.currentStory.plotEvents || []
    },

    // 获取当前时间线事件
    getCurrentTimeline: (state) => {
      if (!state.currentStory) return []
      return state.currentStory.timeline || []
    },

    // 获取当前触发器
    getCurrentTriggers: (state) => {
      if (!state.currentStory) return []
      return state.currentStory.triggers || []
    },
  },

  actions: {
    // 加载故事列表
    async loadStories() {
      this.isLoading = true
      try {
        const { data } = await $fetch('/api/stories')
        this.stories = data
      } catch (error) {
        console.error('Failed to load stories:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 加载特定故事
    async loadStory(id: string) {
      this.isLoading = true
      try {
        const { data } = await $fetch(`/api/stories/${id}`)
        this.currentStory = data
      } catch (error) {
        console.error(`Failed to load story ${id}:`, error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 创建新故事
    async createStory(title: string, description?: string) {
      this.isLoading = true
      try {
        const newStory: Partial<Story> = {
          id: crypto.randomUUID(),
          title,
          description: description || '',
          worldSetting: {
            id: crypto.randomUUID(),
            name: `${title}的世界`,
            description: '请描述这个世界的基本设定',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          entities: [],
          relationships: [],
          plotEvents: [],
          timeline: [],
          triggers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'draft'
        }

        const { data } = await $fetch('/api/stories', {
          method: 'POST',
          body: newStory
        })

        this.currentStory = data as Story
        this.stories.push(data as Story)

        return data
      } catch (error) {
        console.error('Failed to create story:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 更新当前故事
    async updateCurrentStory() {
      if (!this.currentStory) {
        throw new Error('No current story to update')
      }

      this.isLoading = true
      try {
        const { data } = await $fetch(`/api/stories/${this.currentStory.id}`, {
          method: 'PUT',
          body: this.currentStory
        })

        this.currentStory = data as Story

        // 更新本地列表
        const index = this.stories.findIndex(s => s.id === this.currentStory?.id)
        if (index !== -1) {
          this.stories[index] = data as Story
        }
      } catch (error) {
        console.error('Failed to update story:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 删除故事
    async deleteStory(id: string) {
      try {
        await $fetch(`/api/stories/${id}`, {
          method: 'DELETE'
        })

        this.stories = this.stories.filter(story => story.id !== id)
        if (this.currentStory?.id === id) {
          this.currentStory = null
        }
      } catch (error) {
        console.error(`Failed to delete story ${id}:`, error)
        throw error
      }
    },

    // 设置当前故事
    setCurrentStory(story: Story | null) {
      this.currentStory = story
    },

    // 设置当前故事的世界设定
    setWorldSetting(worldSetting: WorldSetting) {
      if (!this.currentStory) {
        throw new Error('No current story to update')
      }

      this.currentStory.worldSetting = worldSetting
      this.currentStory.updatedAt = new Date()
    },

    // 添加实体
    addEntity(entity: any) {
      if (!this.currentStory) {
        throw new Error('No current story to update')
      }

      this.currentStory.entities.push(entity)
      this.currentStory.updatedAt = new Date()
    },

    // 更新实体
    updateEntity(id: string, updatedEntity: any) {
      if (!this.currentStory) {
        throw new Error('No current story to update')
      }

      const index = this.currentStory.entities.findIndex(e => e.id === id)
      if (index !== -1) {
        this.currentStory.entities[index] = { ...this.currentStory.entities[index], ...updatedEntity, updatedAt: new Date() }
        this.currentStory.updatedAt = new Date()
      }
    },

    // 删除实体
    removeEntity(id: string) {
      if (!this.currentStory) {
        throw new Error('No current story to update')
      }

      this.currentStory.entities = this.currentStory.entities.filter(e => e.id !== id)
      this.currentStory.relationships = this.currentStory.relationships.filter(
        r => r.source !== id && r.target !== id
      )
      this.currentStory.updatedAt = new Date()
    },

    // 添加关系
    addRelationship(relationship: any) {
      if (!this.currentStory) {
        throw new Error('No current story to update')
      }

      this.currentStory.relationships.push(relationship)
      this.currentStory.updatedAt = new Date()
    },

    // 更新关系
    updateRelationship(id: string, updatedRelationship: any) {
      if (!this.currentStory) {
        throw new Error('No current story to update')
      }

      const index = this.currentStory.relationships.findIndex(r => r.id === id)
      if (index !== -1) {
        this.currentStory.relationships[index] = { ...this.currentStory.relationships[index], ...updatedRelationship, updatedAt: new Date() }
        this.currentStory.updatedAt = new Date()
      }
    },

    // 删除关系
    removeRelationship(id: string) {
      if (!this.currentStory) {
        throw new Error('No current story to update')
      }

      this.currentStory.relationships = this.currentStory.relationships.filter(r => r.id !== id)
      this.currentStory.updatedAt = new Date()
    },

    // 添加剧情事件
    addPlotEvent(event: PlotEvent) {
      if (!this.currentStory) {
        throw new Error('No current story to update')
      }

      this.currentStory.plotEvents.push(event)
      this.currentStory.updatedAt = new Date()
    },

    // 更新剧情事件
    updatePlotEvent(id: string, updatedEvent: Partial<PlotEvent>) {
      if (!this.currentStory) {
        throw new Error('No current story to update')
      }

      const index = this.currentStory.plotEvents.findIndex(e => e.id === id)
      if (index !== -1) {
        this.currentStory.plotEvents[index] = { ...this.currentStory.plotEvents[index], ...updatedEvent, updatedAt: new Date() }
        this.currentStory.updatedAt = new Date()
      }
    },

    // 设置选中的事件
    setSelectedEvent(event: PlotEvent | null) {
      this.selectedEvent = event
    },

    // 设置选中的时间线事件
    setSelectedTimelineEvent(event: TimelineEvent | null) {
      this.selectedTimelineEvent = event
    },

    // 设置选中的触发器
    setSelectedTrigger(trigger: Trigger | null) {
      this.selectedTrigger = trigger
    },

    // 开始生成
    startGenerating() {
      this.isGenerating = true
      this.generationProgress = 0
    },

    // 更新生成进度
    updateGenerationProgress(progress: number) {
      this.generationProgress = progress
    },

    // 结束生成
    finishGenerating() {
      this.isGenerating = false
      this.generationProgress = 100
    },
  },
})
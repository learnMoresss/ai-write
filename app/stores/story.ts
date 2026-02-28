import { defineStore } from 'pinia'

export interface Story {
  id: string
  title: string
  description: string
  worldSetting: WorldSetting
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'in-progress' | 'completed'
}

export interface WorldSetting {
  geography: string
  politicalSystem: string
  cultivationLevel: string
  currencySystem: string
  cultureBackground: string
  timeline: Timeline[]
}

export interface Timeline {
  id: string
  name: string
  description: string
  startTime: string
  endTime?: string
}

export const useStoryStore = defineStore('story', {
  state: () => ({
    currentStory: undefined as Story | undefined,
    stories: [] as Story[],
    isGenerating: false,
    generationProgress: 0,
  }),

  getters: {
    getCurrentStory(): Story | undefined {
      return this.currentStory
    },
    getAllStories(): Story[] {
      return this.stories
    },
    getIsGenerating(): boolean {
      return this.isGenerating
    }
  },

  actions: {
    async loadStory(storyId: string) {
      // 模拟API调用获取故事
      this.currentStory = this.stories.find(s => s.id === storyId)
    },

    async saveStory(story: Story) {
      const existingIndex = this.stories.findIndex(s => s.id === story.id)
      if (existingIndex >= 0) {
        this.stories[existingIndex] = { ...story, updatedAt: new Date() }
      } else {
        this.stories.push({ ...story, createdAt: new Date(), updatedAt: new Date() })
      }

      if (this.currentStory?.id === story.id) {
        this.currentStory = { ...story, updatedAt: new Date() }
      }
    },

    async createStory(title: string, description: string) {
      const newStory: Story = {
        id: crypto.randomUUID(),
        title,
        description,
        worldSetting: {
          geography: '',
          politicalSystem: '',
          cultivationLevel: '',
          currencySystem: '',
          cultureBackground: '',
          timeline: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft'
      }

      this.stories.push(newStory)
      this.currentStory = newStory

      return newStory
    },

    async deleteStory(storyId: string) {
      this.stories = this.stories.filter(s => s.id !== storyId)
      if (this.currentStory?.id === storyId) {
        this.currentStory = undefined
      }
    },

    setIsGenerating(status: boolean) {
      this.isGenerating = status
    },

    setGenerationProgress(progress: number) {
      this.generationProgress = progress
    }
  }
})
import { defineStore } from 'pinia'

export interface TriggerCondition {
  time?: string
  location?: string
  characterPresence?: string[]
  characterState?: Record<string, any>
  storyPhase?: string
}

export interface TriggerAction {
  type: 'plot_event' | 'character_interaction' | 'world_event' | 'reveal_mystery'
  description: string
  target?: string
}

export interface TriggerImpact {
  characterChanges?: Record<string, any>
  relationshipChanges?: { source: string, target: string, change: number }[]
  reputationChanges?: Record<string, number>
  inventoryChanges?: Record<string, any>
}

export interface PlotTrigger {
  id: string
  name: string
  description: string
  condition: TriggerCondition
  action: TriggerAction
  impact: TriggerImpact
  isActive: boolean
  isMystery?: boolean  // 是否为伏笔
  mysteryResolvedIn?: string  // 对应解决的节点ID
  status: 'pending' | 'active' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export const useTriggersStore = defineStore('triggers', {
  state: () => ({
    triggers: [] as PlotTrigger[],
    activeTriggers: [] as PlotTrigger[],
  }),

  getters: {
    getAllTriggers(): PlotTrigger[] {
      return this.triggers
    },
    getActiveTriggers(): PlotTrigger[] {
      return this.activeTriggers
    },
    getTriggerById: (state) => (id: string) => {
      return state.triggers.find(trigger => trigger.id === id)
    },
    getTriggersByCharacter: (state) => (characterId: string) => {
      return state.triggers.filter(trigger =>
        trigger.condition.characterPresence?.includes(characterId) ||
        Object.keys(trigger.condition.characterState || {}).includes(characterId)
      )
    }
  },

  actions: {
    addTrigger(trigger: Omit<PlotTrigger, 'id' | 'createdAt' | 'updatedAt'>) {
      const newTrigger: PlotTrigger = {
        ...trigger,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending'
      }

      this.triggers.push(newTrigger)
      this.updateActiveTriggers()
    },

    updateTrigger(id: string, data: Partial<PlotTrigger>) {
      const index = this.triggers.findIndex(trigger => trigger.id === id)
      if (index !== -1) {
        Object.assign(this.triggers[index], data, { updatedAt: new Date() })
        this.updateActiveTriggers()
      }
    },

    deleteTrigger(id: string) {
      this.triggers = this.triggers.filter(trigger => trigger.id !== id)
      this.updateActiveTriggers()
    },

    evaluateTriggers(): PlotTrigger[] {
      // 简化的触发器评估逻辑
      // 在实际实现中，这将包含更复杂的条件匹配逻辑
      return this.triggers.filter(trigger => {
        // 检查触发器条件是否满足
        // 这里简化了逻辑，实际应该有更复杂的条件判断
        return trigger.isActive && trigger.status === 'pending'
      })
    },

    updateActiveTriggers() {
      this.activeTriggers = this.evaluateTriggers()
    },

    activateTrigger(triggerId: string) {
      const index = this.triggers.findIndex(t => t.id === triggerId)
      if (index !== -1) {
        this.triggers[index].isActive = true
        this.triggers[index].status = 'active'
        this.triggers[index].updatedAt = new Date()
        this.updateActiveTriggers()
      }
    },

    completeTrigger(triggerId: string) {
      const index = this.triggers.findIndex(t => t.id === triggerId)
      if (index !== -1) {
        this.triggers[index].status = 'completed'
        this.triggers[index].updatedAt = new Date()
        this.updateActiveTriggers()
      }
    }
  }
})
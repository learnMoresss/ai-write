// stores/triggers.ts
import { defineStore } from 'pinia'
import type { Trigger, TriggerCondition, TriggerAction, TimelineEvent } from '~/types/story'

export const useTriggerStore = defineStore('triggers', {
  state: () => ({
    triggers: [] as Trigger[],
    activeTriggers: [] as Trigger[],
    evaluatedTriggers: [] as { trigger: Trigger, satisfied: boolean, reason?: string }[],
    isLoading: false,
    isEvaluating: false,
  }),

  getters: {
    getAllTriggers: (state) => state.triggers,
    getActiveTriggers: (state) => state.activeTriggers,
    getEvaluatedTriggers: (state) => state.evaluatedTriggers,
    getIsLoading: (state) => state.isLoading,
    getIsEvaluating: (state) => state.isEvaluating,

    // 根据ID获取特定触发器
    getTriggerById: (state) => (id: string) => {
      return state.triggers.find(trigger => trigger.id === id)
    },

    // 获取特定状态的触发器
    getTriggersByStatus: (state) => (status: string) => {
      return state.triggers.filter(trigger => trigger.status === status)
    },

    // 获取高优先级的触发器
    getHighPriorityTriggers: (state) => {
      return state.triggers
        .filter(trigger => trigger.priority > 5)
        .sort((a, b) => b.priority - a.priority)
    },
  },

  actions: {
    // 设置触发器列表
    setTriggers(triggers: Trigger[]) {
      this.triggers = triggers
    },

    // 添加触发器
    async addTrigger(trigger: Trigger) {
      // 检查触发器ID是否已存在
      if (this.triggers.some(t => t.id === trigger.id)) {
        console.warn(`Trigger with ID ${trigger.id} already exists`)
        return
      }

      this.triggers.push(trigger)

      // 调用API保存到后端
      try {
        const response = await $fetch('/api/triggers', {
          method: 'POST',
          body: trigger
        })

        // 更新本地触发器以反映后端响应
        const index = this.triggers.findIndex(t => t.id === trigger.id)
        if (index !== -1) {
          this.triggers[index] = response.data
        }
      } catch (error) {
        console.error('Failed to save trigger to backend:', error)
        // 从本地移除，因为保存失败
        this.triggers = this.triggers.filter(t => t.id !== trigger.id)
        throw error
      }
    },

    // 更新触发器
    async updateTrigger(id: string, updates: Partial<Trigger>) {
      const index = this.triggers.findIndex(trigger => trigger.id === id)
      if (index === -1) return

      const oldTrigger = { ...this.triggers[index] }
      this.triggers[index] = { ...this.triggers[index], ...updates, updatedAt: new Date() }

      // 调用API更新后端
      try {
        const response = await $fetch(`/api/triggers/${id}`, {
          method: 'PUT',
          body: this.triggers[index]
        })

        // 使用后端返回的最新数据更新本地存储
        this.triggers[index] = response.data
      } catch (error) {
        console.error('Failed to update trigger in backend:', error)
        // 恢复旧值，因为保存失败
        this.triggers[index] = oldTrigger
        throw error
      }
    },

    // 删除触发器
    async removeTrigger(id: string) {
      const trigger = this.triggers.find(t => t.id === id)
      if (!trigger) return

      try {
        await $fetch(`/api/triggers/${id}`, {
          method: 'DELETE'
        })

        // 成功删除后，从本地移除
        this.triggers = this.triggers.filter(trigger => trigger.id !== id)
      } catch (error) {
        console.error(`Failed to delete trigger ${id} from backend:`, error)
        throw error
      }
    },

    // 激活触发器
    activateTrigger(id: string) {
      const index = this.triggers.findIndex(trigger => trigger.id === id)
      if (index === -1) return

      this.triggers[index].status = 'active'
      this.triggers[index].updatedAt = new Date()

      // 添加到活跃触发器列表
      if (!this.activeTriggers.some(t => t.id === id)) {
        this.activeTriggers.push(this.triggers[index])
      }
    },

    // 停用触发器
    deactivateTrigger(id: string) {
      const index = this.triggers.findIndex(trigger => trigger.id === id)
      if (index === -1) return

      this.triggers[index].status = 'inactive'
      this.triggers[index].updatedAt = new Date()

      // 从活跃触发器列表中移除
      this.activeTriggers = this.activeTriggers.filter(trigger => trigger.id !== id)
    },

    // 设置触发器状态
    setTriggerStatus(id: string, status: 'active' | 'inactive' | 'completed') {
      const index = this.triggers.findIndex(trigger => trigger.id === id)
      if (index === -1) return

      this.triggers[index].status = status
      this.triggers[index].updatedAt = new Date()

      // 根据新状态更新活跃列表
      if (status === 'active' && !this.activeTriggers.some(t => t.id === id)) {
        this.activeTriggers.push(this.triggers[index])
      } else if (status !== 'active') {
        this.activeTriggers = this.activeTriggers.filter(trigger => trigger.id !== id)
      }
    },

    // 评估单个触发器条件
    evaluateTrigger(trigger: Trigger, context: any): { satisfied: boolean, reason?: string } {
      try {
        const { condition } = trigger.condition

        // 根据条件类型进行评估
        switch (condition.type) {
          case 'time':
            // 时间条件评估
            const currentTime = new Date()
            if (condition.timeReference) {
              const timeDiff = Math.abs(currentTime.getTime() - new Date(condition.timeReference).getTime())
              const timeThreshold = 24 * 60 * 60 * 1000 // 1天的时间差阈值

              if (condition.operator === 'before') {
                return {
                  satisfied: currentTime < new Date(condition.timeReference),
                  reason: currentTime < new Date(condition.timeReference) ? '时间条件满足' : '时间尚未到达'
                }
              } else if (condition.operator === 'after') {
                return {
                  satisfied: currentTime > new Date(condition.timeReference),
                  reason: currentTime > new Date(condition.timeReference) ? '时间条件满足' : '时间尚未超过参考时间'
                }
              }
            }
            break

          case 'location':
            // 地点条件评估
            const targetLocation = condition.value
            const currentLocation = context.location || context.currentLocation
            return {
              satisfied: currentLocation === targetLocation,
              reason: currentLocation === targetLocation ? '地点条件满足' : `当前不在${targetLocation}`
            }

          case 'character-presence':
            // 角色存在条件评估
            const requiredCharacter = condition.value
            const participantList = context.participants || []
            return {
              satisfied: participantList.includes(requiredCharacter),
              reason: participantList.includes(requiredCharacter) ? '角色在场' : `所需角色${requiredCharacter}不在场`
            }

          case 'attribute-threshold':
            // 属性阈值条件评估
            const entityAttribute = this.getEntityAttribute(condition.entityId, condition.property, context)
            if (typeof entityAttribute === 'undefined') {
              return { satisfied: false, reason: `无法获取实体${condition.entityId}的属性${condition.property}` }
            }

            if (condition.operator === 'greater-than') {
              return {
                satisfied: Number(entityAttribute) > Number(condition.value),
                reason: Number(entityAttribute) > Number(condition.value) ? '属性值满足阈值' : `属性值${entityAttribute}未超过${condition.value}`
              }
            } else if (condition.operator === 'less-than') {
              return {
                satisfied: Number(entityAttribute) < Number(condition.value),
                reason: Number(entityAttribute) < Number(condition.value) ? '属性值满足阈值' : `属性值${entityAttribute}未低于${condition.value}`
              }
            } else if (condition.operator === 'equals') {
              return {
                satisfied: entityAttribute == condition.value, // 使用宽松相等，允许类型转换
                reason: entityAttribute == condition.value ? '属性值满足条件' : `属性值${entityAttribute}不等于${condition.value}`
              }
            }
            break

          case 'relationship-status':
            // 关系状态条件评估
            const { source, target, relationType } = condition.value || {}
            if (!source || !target || !relationType) {
              return { satisfied: false, reason: '关系条件参数不足' }
            }

            const relationshipExists = this.checkRelationship(source, target, relationType, context)
            return {
              satisfied: relationshipExists,
              reason: relationshipExists ? '关系条件满足' : `不存在${source}与${target}之间的${relationType}关系`
            }

          case 'plot-event-status':
            // 剧情事件状态条件评估
            const { eventId, expectedStatus } = condition.value || {}
            if (!eventId || !expectedStatus) {
              return { satisfied: false, reason: '剧情事件条件参数不足' }
            }

            const eventStatus = this.getPlotEventStatus(eventId, context)
            return {
              satisfied: eventStatus === expectedStatus,
              reason: eventStatus === expectedStatus ? '剧情事件状态满足' : `剧情事件${eventId}状态为${eventStatus}而非${expectedStatus}`
            }

          default:
            return { satisfied: false, reason: `未知的条件类型: ${condition.type}` }
        }

        return { satisfied: false, reason: '条件评估失败或不完整' }
      } catch (error) {
        console.error(`Error evaluating trigger ${trigger.id}:`, error)
        return { satisfied: false, reason: `评估错误: ${error.message}` }
      }
    },

    // 辅助方法：获取实体属性
    getEntityAttribute(entityId: string, property: string, context: any) {
      // 从上下文中查找实体属性
      if (context.entities) {
        const entity = context.entities.find((e: any) => e.id === entityId)
        if (entity && typeof entity.properties === 'object') {
          return entity.properties[property]
        }
      }

      // 如果在当前存储中有实体，也检查那里
      const entityStore = useEntityStore()
      const storedEntity = entityStore.getNodeById(entityId)
      if (storedEntity) {
        return storedEntity.properties[property]
      }

      return undefined
    },

    // 辅助方法：检查关系是否存在
    checkRelationship(sourceId: string, targetId: string, relationType: string, context: any) {
      // 检查上下文中的关系
      if (context.relationships) {
        return context.relationships.some((rel: any) =>
          (rel.source === sourceId && rel.target === targetId && rel.relation === relationType) ||
          (rel.source === targetId && rel.target === sourceId && rel.relation === relationType)
        )
      }

      // 检查当前存储中的关系
      const entityStore = useEntityStore()
      const connections = entityStore.getNodeConnections(sourceId)
      return connections.all.some(edge =>
        (edge.source === sourceId && edge.target === targetId && edge.relation === relationType) ||
        (edge.source === targetId && edge.target === sourceId && edge.relation === relationType)
      )
    },

    // 辅助方法：获取剧情事件状态
    getPlotEventStatus(eventId: string, context: any) {
      // 检查上下文中的剧情事件
      if (context.plotEvents) {
        const event = context.plotEvents.find((e: any) => e.id === eventId)
        if (event) {
          return event.status
        }
      }

      // 检查故事存储中的剧情事件
      const storyStore = useStoryStore()
      if (storyStore.getCurrentStory) {
        const event = storyStore.getCurrentStory.plotEvents.find((e: any) => e.id === eventId)
        if (event) {
          return event.status
        }
      }

      return null
    },

    // 评估所有激活的触发器
    async evaluateAllTriggers(context: any = {}) {
      this.isEvaluating = true
      this.evaluatedTriggers = []

      try {
        // 获取当前故事上下文
        const storyStore = useStoryStore()
        if (!context.entities) {
          context.entities = storyStore.getCurrentEntities
        }
        if (!context.relationships) {
          context.relationships = storyStore.getCurrentRelationships
        }
        if (!context.plotEvents) {
          context.plotEvents = storyStore.getCurrentPlotEvents
        }

        // 评估所有活跃触发器
        for (const trigger of this.activeTriggers) {
          const result = this.evaluateTrigger(trigger, context)
          this.evaluatedTriggers.push({ trigger, ...result })

          // 如果条件满足，则执行动作
          if (result.satisfied) {
            await this.executeTriggerAction(trigger, context)
          }
        }
      } catch (error) {
        console.error('Failed to evaluate triggers:', error)
        throw error
      } finally {
        this.isEvaluating = false
      }
    },

    // 执行触发器动作
    async executeTriggerAction(trigger: Trigger, context: any = {}) {
      try {
        const action = trigger.action

        switch (action.type) {
          case 'activate-plot-event':
            // 激活剧情事件
            const storyStore = useStoryStore()
            if (action.target) {
              storyStore.updatePlotEvent(action.target, { status: 'active' })
            }
            break

          case 'modify-entity-attribute':
            // 修改实体属性
            const { entityId, attribute, newValue } = action.parameters
            if (entityId && attribute) {
              const entityStore = useEntityStore()
              const entity = entityStore.getNodeById(entityId)

              if (entity) {
                const updatedProperties = { ...entity.properties, [attribute]: newValue }
                await entityStore.updateNode(entityId, { properties: updatedProperties })
              }
            }
            break

          case 'create-relationship':
            // 创建关系
            const { source, target, relation, weight = 50 } = action.parameters
            if (source && target && relation) {
              const entityStore = useEntityStore()
              const newEdge = {
                id: crypto.randomUUID(),
                source,
                target,
                relation,
                weight,
                properties: {},
                createdAt: new Date(),
                updatedAt: new Date()
              }
              await entityStore.addEdge(newEdge)
            }
            break

          case 'change-location':
            // 更改位置
            // 这通常会影响剧情上下文
            break

          case 'execute-script':
            // 执行脚本
            // 可能需要更复杂的逻辑
            break

          default:
            console.warn(`Unknown action type: ${action.type}`)
        }

        // 记录执行动作
        console.log(`Executed action for trigger ${trigger.name}:`, action)
      } catch (error) {
        console.error(`Failed to execute action for trigger ${trigger.id}:`, error)
        throw error
      }
    },

    // 添加时间线事件
    async addTimelineEvent(event: TimelineEvent) {
      // 这里需要添加到故事的timeline中
      const storyStore = useStoryStore()
      if (storyStore.currentStory) {
        storyStore.currentStory.timeline.push(event)
        storyStore.currentStory.updatedAt = new Date()
        await storyStore.updateCurrentStory()
      }
    },

    // 加载触发器数据
    async loadTriggerData() {
      this.isLoading = true
      try {
        const response = await $fetch('/api/triggers')
        this.triggers = response.data
        this.activeTriggers = this.triggers.filter(trigger => trigger.status === 'active')
      } catch (error) {
        console.error('Failed to load trigger data:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 重置状态
    reset() {
      this.triggers = []
      this.activeTriggers = []
      this.evaluatedTriggers = []
    }
  },
})
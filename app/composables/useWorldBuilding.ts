// composables/useWorldBuilding.ts
import { ref } from 'vue'
import { useAiStore } from '~/stores/ai'
import { useStoryStore } from '~/stores/story'
import { WorldBuildingRequest } from '~/types/ai'

export function useWorldBuilding() {
  const aiStore = useAiStore()
  const storyStore = useStoryStore()

  const isBuilding = ref(false)
  const progress = ref(0)

  // 根据种子描述生成世界观
  async function generateWorldFromSeed(seed: string, elements?: WorldBuildingRequest['elements']) {
    isBuilding.value = true
    progress.value = 0

    try {
      // 更新进度
      progress.value = 10

      // 准备请求
      const request: WorldBuildingRequest = {
        seed,
        elements: elements || ['geography', 'politics', 'cultivation', 'culture']
      }

      progress.value = 30

      // 使用AI生成世界观的各个部分
      const worldParts = []

      if (request.elements?.includes('geography')) {
        const geoPrompt = `根据以下背景创建详细的地理环境: ${seed}\n\n请描述主要大陆、地形、气候、自然资源、重要的城市和地标。`
        const geoResponse = await aiStore.generateContent(geoPrompt)
        worldParts.push({ category: 'geography', content: geoResponse.content })
        progress.value = 40
      }

      if (request.elements?.includes('politics')) {
        const politicsPrompt = `根据以下背景创建政治体系: ${seed}\n\n请描述主要势力、政权形式、权力结构、外交关系、重要政治人物。`
        const politicsResponse = await aiStore.generateContent(politicsPrompt)
        worldParts.push({ category: 'politicalSystem', content: politicsResponse.content })
        progress.value = 50
      }

      if (request.elements?.includes('cultivation')) {
        const cultivationPrompt = `根据以下背景创建修炼/能力体系: ${seed}\n\n请描述修炼等级、技能类型、资源需求、限制条件、顶级强者。`
        const cultivationResponse = await aiStore.generateContent(cultivationPrompt)
        worldParts.push({ category: 'cultivationLevel', content: cultivationResponse.content })
        progress.value = 60
      }

      if (request.elements?.includes('culture')) {
        const culturePrompt = `根据以下背景创建文化背景: ${seed}\n\n请描述主流信仰、习俗传统、艺术形式、社会结构、教育方式。`
        const cultureResponse = await aiStore.generateContent(culturePrompt)
        worldParts.push({ category: 'cultureBackground', content: cultureResponse.content })
        progress.value = 70
      }

      if (request.elements?.includes('magic_system')) {
        const magicPrompt = `根据以下背景创建魔法/超能力系统: ${seed}\n\n请描述魔法原理、施法方式、能量来源、限制因素、禁忌法术。`
        const magicResponse = await aiStore.generateContent(magicPrompt)
        worldParts.push({ category: 'magicSystem', content: magicResponse.content })
        progress.value = 80
      }

      if (request.elements?.includes('technology')) {
        const techPrompt = `根据以下背景创建科技水平: ${seed}\n\n请描述主要技术、工业水平、交通工具、通讯手段、军事装备。`
        const techResponse = await aiStore.generateContent(techPrompt)
        worldParts.push({ category: 'technology', content: techResponse.content })
        progress.value = 90
      }

      // 组织生成的世界观数据
      const worldSetting = {
        geography: '',
        politicalSystem: '',
        cultivationLevel: '',
        currencySystem: '待定',
        cultureBackground: '',
        timeline: [],
        ...Object.fromEntries(worldParts.map(part => [part.category, part.content]))
      }

      progress.value = 100

      return worldSetting
    } catch (error) {
      console.error('世界观生成失败:', error)
      throw error
    } finally {
      isBuilding.value = false
    }
  }

  // 优化现有世界观
  async function optimizeWorld(currentWorld: any, improvementRequest: string) {
    isBuilding.value = true
    progress.value = 0

    try {
      const prompt = `当前世界观如下:\n\n${JSON.stringify(currentWorld, null, 2)}\n\n请根据以下要求优化世界观: ${improvementRequest}`

      const response = await aiStore.generateContent(prompt)

      // 这里可以解析AI返回的内容并更新世界观结构
      return {
        ...currentWorld,
        // 根据AI响应更新特定字段
        optimizedContent: response.content
      }
    } catch (error) {
      console.error('世界观优化失败:', error)
      throw error
    } finally {
      isBuilding.value = false
    }
  }

  // 创建时间线事件
  async function generateTimeline(seed: string) {
    isBuilding.value = true

    try {
      const prompt = `根据以下背景创建故事时间线: ${seed}\n\n请创建重要历史事件的时间线，包括事件名称、时间、简要描述。`

      const response = await aiStore.generateContent(prompt)

      // 解析AI返回的时间线数据
      // 这里简化处理，实际应用中需要更复杂的解析逻辑
      return [
        {
          id: crypto.randomUUID(),
          name: '初始纪元',
          description: '世界的起源',
          startTime: 'Year 0',
        },
        {
          id: crypto.randomUUID(),
          name: '重大事件',
          description: response.content.substring(0, 100) + '...',
          startTime: 'Year 1000',
        }
      ]
    } catch (error) {
      console.error('时间线生成失败:', error)
      throw error
    } finally {
      isBuilding.value = false
    }
  }

  return {
    isBuilding,
    progress,
    generateWorldFromSeed,
    optimizeWorld,
    generateTimeline
  }
}
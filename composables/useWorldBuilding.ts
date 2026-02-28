// composables/useWorldBuilding.ts
import { ref } from 'vue'
import type { WorldSetting } from '~/types/story'
import { useStoryStore } from '~/stores/story'
import { useAiStore } from '~/stores/ai'

export function useWorldBuilding() {
  const storyStore = useStoryStore()
  const aiStore = useAiStore()

  const isBuilding = ref(false)
  const buildProgress = ref(0)
  const buildLog = ref<string[]>([])

  // 创建新的世界观
  const createEmptyWorld = (name: string, description: string): WorldSetting => {
    return {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // 基于种子构建世界观
  const buildWorldFromSeed = async (
    seed: string,
    focusAreas?: string[],
    expansionLevel: 'basic' | 'detailed' | 'comprehensive' = 'detailed'
  ): Promise<WorldSetting> => {
    isBuilding.value = true
    buildProgress.value = 0
    buildLog.value = [`开始构建世界观: ${seed}`]

    try {
      // 更新进度
      buildProgress.value = 10

      // 准备AI请求
      const request = {
        seed,
        focusAreas,
        expansionLevel,
        customInstructions: "请构建一个逻辑一致且富有想象力的世界观，包含地理、政治、修炼或科技体系等元素"
      }

      buildLog.value.push('正在发送AI请求...')
      buildProgress.value = 30

      // 调用AI生成世界观
      const generatedWorld = await aiStore.generateWorld(request)

      buildLog.value.push('AI生成完成，正在处理结果...')
      buildProgress.value = 70

      // 设置为当前故事的世界观
      if (storyStore.currentStory) {
        storyStore.setWorldSetting(generatedWorld)
        generatedWorld.updatedAt = new Date()
      }

      buildLog.value.push('世界观构建完成!')
      buildProgress.value = 100

      return generatedWorld
    } catch (error: any) {
      console.error('World building failed:', error)
      buildLog.value.push(`错误: ${error.message || '未知错误'}`)
      throw error
    } finally {
      isBuilding.value = false
    }
  }

  // 扩展现有世界观
  const expandWorldSetting = async (
    world: WorldSetting,
    aspect: string,
    detailLevel: 'summary' | 'detailed' | 'comprehensive' = 'detailed'
  ): Promise<WorldSetting> => {
    isBuilding.value = true
    buildProgress.value = 0
    buildLog.value = [`正在扩展现有世界观的 ${aspect} 方面`]

    try {
      buildProgress.value = 20
      buildLog.value.push('准备AI扩展请求...')

      // 构建上下文
      const context = {
        currentWorld: world,
        aspectToExpand: aspect,
        detailLevel
      }

      buildProgress.value = 40
      buildLog.value.push('发送AI扩展请求...')

      // 这里需要调用后端API来扩展世界观的特定方面
      const response = await $fetch('/api/ai/expand-world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          world,
          aspect,
          detailLevel,
          context
        }
      })

      buildProgress.value = 80
      buildLog.value.push('更新世界观数据...')

      // 合并扩展的结果
      const expandedWorld = {
        ...world,
        ...response.expandedData,
        updatedAt: new Date()
      }

      // 如果这是当前故事的世界观，则更新它
      if (storyStore.currentStory && storyStore.currentStory.worldSetting.id === world.id) {
        storyStore.setWorldSetting(expandedWorld)
      }

      buildProgress.value = 100
      buildLog.value.push('世界观扩展完成!')

      return expandedWorld
    } catch (error: any) {
      console.error('World expansion failed:', error)
      buildLog.value.push(`错误: ${error.message || '未知错误'}`)
      throw error
    } finally {
      isBuilding.value = false
    }
  }

  // 优化世界观的一致性
  const optimizeWorldConsistency = async (world: WorldSetting): Promise<WorldSetting> => {
    isBuilding.value = true
    buildProgress.value = 0
    buildLog.value = ['正在分析世界观的一致性...']

    try {
      buildProgress.value = 25
      buildLog.value.push('识别潜在的不一致之处...')

      // 分析世界观中的潜在冲突
      const inconsistencies = await analyzeWorldInconsistencies(world)

      buildProgress.value = 50
      buildLog.value.push(`发现 ${inconsistencies.length} 个潜在不一致之处`)

      if (inconsistencies.length === 0) {
        buildLog.value.push('世界观已经是一致的，无需优化')
        buildProgress.value = 100
        return world
      }

      buildLog.value.push('准备AI优化请求...')
      buildProgress.value = 70

      // 让AI修复不一致之处
      const optimizedWorld = await $fetch('/api/ai/optimize-world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          world,
          inconsistencies
        }
      })

      buildLog.value.push('应用优化结果...')
      buildProgress.value = 90

      // 更新世界观
      const resultWorld = {
        ...optimizedWorld,
        updatedAt: new Date()
      }

      // 如果这是当前故事的世界观，则更新它
      if (storyStore.currentStory && storyStore.currentStory.worldSetting.id === world.id) {
        storyStore.setWorldSetting(resultWorld)
      }

      buildProgress.value = 100
      buildLog.value.push('世界观一致性优化完成!')

      return resultWorld
    } catch (error: any) {
      console.error('World optimization failed:', error)
      buildLog.value.push(`错误: ${error.message || '未知错误'}`)
      throw error
    } finally {
      isBuilding.value = false
    }
  }

  // 分析世界观中的不一致之处
  const analyzeWorldInconsistencies = async (world: WorldSetting): Promise<string[]> => {
    // 这里进行简单的逻辑分析，实际实现可能会更复杂
    const inconsistencies: string[] = []

    // 示例：检查一些基本的一致性
    if (world.cultivationSystem && world.technologyLevel) {
      // 检查修炼体系和科技水平是否冲突
      const isCultivationBased = world.cultivationSystem.toLowerCase().includes('修仙') ||
                                world.cultivationSystem.toLowerCase().includes('魔法')

      const isTechBased = world.technologyLevel.toLowerCase().includes('赛博') ||
                         world.technologyLevel.toLowerCase().includes('机械')

      if (isCultivationBased && isTechBased) {
        inconsistencies.push('修炼体系和科技水平可能存在概念冲突')
      }
    }

    // 检查地理描述和政治体系的一致性
    if (world.geography && world.politicalSystem) {
      // 简单检查，例如：海洋世界的国家不应该完全由陆地政治体系统治
      if (world.geography.toLowerCase().includes('海洋') &&
          world.politicalSystem.toLowerCase().includes('封建制') &&
          !world.politicalSystem.toLowerCase().includes('海上') &&
          !world.politicalSystem.toLowerCase().includes('岛国')) {
        inconsistencies.push('海洋世界的政治体系可能需要调整以适应地理环境')
      }
    }

    return inconsistencies
  }

  // 验证世界观的完整性
  const validateWorldCompleteness = (world: WorldSetting): { isValid: boolean; issues: string[] } => {
    const issues: string[] = []

    if (!world.name || world.name.trim().length === 0) {
      issues.push('世界观名称不能为空')
    }

    if (!world.description || world.description.trim().length === 0) {
      issues.push('世界观描述不能为空')
    }

    // 检查是否有基本的设定元素
    if (!world.geography && !world.politicalSystem && !world.cultivationSystem &&
        !world.magicSystem && !world.technologyLevel) {
      issues.push('世界观缺少基本设定元素（地理、政治、修炼、法术或科技体系）')
    }

    // 检查是否有独特的特征
    if (!world.uniqueFeatures || world.uniqueFeatures.length === 0) {
      issues.push('建议添加独特的世界观特色')
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }

  // 生成世界观摘要
  const generateWorldSummary = (world: WorldSetting): string => {
    const parts = []

    if (world.name) {
      parts.push(`**${world.name}**`)
    }

    if (world.description) {
      parts.push(world.description.substring(0, 200) + (world.description.length > 200 ? '...' : ''))
    }

    if (world.geography) {
      parts.push(`**地理环境**: ${world.geography.substring(0, 100)}${world.geography.length > 100 ? '...' : ''}`)
    }

    if (world.politicalSystem) {
      parts.push(`**政治体系**: ${world.politicalSystem.substring(0, 100)}${world.politicalSystem.length > 100 ? '...' : ''}`)
    }

    if (world.cultivationSystem) {
      parts.push(`**修炼体系**: ${world.cultivationSystem.substring(0, 100)}${world.cultivationSystem.length > 100 ? '...' : ''}`)
    }

    if (world.uniqueFeatures && world.uniqueFeatures.length > 0) {
      parts.push(`**独特特色**: ${world.uniqueFeatures.slice(0, 3).join(', ')}`)
    }

    return parts.join('\n\n')
  }

  // 从模板创建世界观
  const createWorldFromTemplate = (templateName: string): WorldSetting => {
    const templates: Record<string, Partial<WorldSetting>> = {
      'fantasy': {
        name: '奇幻世界',
        description: '一个充满魔法与神秘生物的奇幻世界',
        magicSystem: '元素魔法体系，分为火、水、土、风四大元素',
        geography: '大陆被广阔的森林、高耸的山脉和神秘的魔法之地分割',
        politicalSystem: '多个王国与独立城邦并存，由大法师议会协调',
        uniqueFeatures: ['魔法生物', '古代遗迹', '龙族传说']
      },
      'sci-fi': {
        name: '科幻世界',
        description: '高科技与人工智能主导的未来世界',
        technologyLevel: '高度发达的人工智能和量子技术文明',
        geography: '多个行星殖民地，中央星系为行政中心',
        politicalSystem: '联邦制星际政府，由AI辅助决策',
        uniqueFeatures: ['意识上传', '时空旅行', '基因改造人类']
      },
      'cyberpunk': {
        name: '赛博朋克世界',
        description: '高科技与低生活质量并存的反乌托邦未来',
        technologyLevel: '先进的网络技术、人工智能和人体增强技术',
        geography: '拥挤的超级城市，贫民窟与高科技区并存',
        politicalSystem: '巨型企业控制一切，政府形同虚设',
        uniqueFeatures: ['网络空间', '义体改造', '信息战争']
      },
      'wuxia': {
        name: '武侠世界',
        description: '以武学为尊，江湖恩怨纷争的古代中国背景',
        cultivationSystem: '内力修炼体系，分九品武学境界',
        geography: '山川河流间散布着各大门派和城镇',
        politicalSystem: '朝廷名义统治，实权掌握在江湖门派手中',
        uniqueFeatures: ['轻功水上漂', '内力护体', '奇遇机缘']
      }
    }

    const template = templates[templateName] || templates['fantasy']

    return {
      id: crypto.randomUUID(),
      name: template.name || '新世界观',
      description: template.description || '一个新创造的世界',
      geography: template.geography,
      politicalSystem: template.politicalSystem,
      cultivationSystem: template.cultivationSystem,
      magicSystem: template.magicSystem,
      technologyLevel: template.technologyLevel,
      uniqueFeatures: template.uniqueFeatures || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  return {
    // 状态
    isBuilding,
    buildProgress,
    buildLog,

    // 方法
    createEmptyWorld,
    buildWorldFromSeed,
    expandWorldSetting,
    optimizeWorldConsistency,
    analyzeWorldInconsistencies,
    validateWorldCompleteness,
    generateWorldSummary,
    createWorldFromTemplate
  }
}
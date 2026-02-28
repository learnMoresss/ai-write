// composables/useAiIntegration.ts
import { ref } from 'vue'
import { useAiStore } from '~/stores/ai'
import { useStoryStore } from '~/stores/story'
import { useEntitiesStore } from '~/stores/entities'
import {
  AiRequest,
  AiResponse,
  ApprovalResult,
  CharacterGenerationRequest,
  StoryChunkRequest
} from '~/types/ai'

export function useAiIntegration() {
  const aiStore = useAiStore()
  const storyStore = useStoryStore()
  const entitiesStore = useEntitiesStore()

  // 生成人物
  async function generateCharacter(request: CharacterGenerationRequest): Promise<any> {
    let prompt = `创建一个符合以下描述的角色:\n\n${request.description}\n\n`

    if (request.storyContext) {
      prompt += `故事背景: ${request.storyContext}\n\n`
    }

    if (request.relationships && request.relationships.length > 0) {
      prompt += `与其他角色的关系: ${request.relationships.join(', ')}\n\n`
    }

    prompt += `请提供角色的姓名、外貌特征、性格特点、背景故事、能力和弱点。`

    const response = await aiStore.generateContent(prompt)

    // 解析AI响应并创建角色对象
    return {
      id: crypto.randomUUID(),
      name: '解析自AI响应',
      description: response.content,
      type: 'character',
      properties: {
        appearance: '从响应中解析',
        personality: '从响应中解析',
        background: '从响应中解析',
        abilities: '从响应中解析',
        weaknesses: '从响应中解析'
      }
    }
  }

  // 生成故事片段
  async function generateStoryChunk(request: StoryChunkRequest): Promise<AiResponse> {
    let prompt = `基于以下上下文继续故事:\n\n${request.context}\n\n`

    if (request.previousContent) {
      prompt += `前置内容: ${request.previousContent}\n\n`
    }

    if (request.targetLength) {
      prompt += `期望长度: 约${request.targetLength}字\n\n`
    }

    if (request.style) {
      prompt += `写作风格: ${request.style}\n\n`
    }

    prompt += `请生成连贯且引人入胜的故事内容。`

    return await aiStore.generateContent(prompt, {
      storyId: request.storyId,
      context: request.context
    })
  }

  // 审核内容
  async function approveContent(content: string, context?: any): Promise<ApprovalResult> {
    // 构建审核上下文
    let approvalContext = `请审核以下内容:\n\n${content}\n\n`

    if (context?.previousContent) {
      approvalContext += `\n前置内容: ${context.previousContent}\n\n`
    }

    if (context?.worldSetting) {
      approvalContext += `\n世界观设定: ${JSON.stringify(context.worldSetting, null, 2)}\n\n`
    }

    if (context?.characterStates) {
      approvalContext += `\n角色状态: ${JSON.stringify(context.characterStates, null, 2)}\n\n`
    }

    approvalContext += `
    请检查以下方面:
    1. 物理一致性: 检查角色的位置、状态等是否与前文一致
    2. 逻辑合理性: 检查事件、能力使用等是否合理
    3. 伏笔回收: 检查是否适当回收了之前的伏笔
    4. 角色一致性: 检查角色行为是否符合其性格设定

    返回格式:
    - 如果发现问题，请明确指出问题类型、位置和严重程度
    - 如果没有问题，请批准内容
    `

    // 这里我们会调用AI审核模型，但目前使用模拟实现
    return await aiStore.validateWithAuditor(content, context)
  }

  // 优化世界观
  async function optimizeWorldSetting(seedDescription: string, currentSetting?: any): Promise<any> {
    let prompt = `基于以下背景优化世界观:\n\n${seedDescription}\n\n`

    if (currentSetting) {
      prompt += `当前世界观:\n${JSON.stringify(currentSetting, null, 2)}\n\n`
    }

    prompt += `请完善和优化世界观的以下方面: 地理分布、势力划分、等级体系、文化背景。确保内部逻辑一致且富有想象力。`

    const response = await aiStore.generateContent(prompt)

    // 解析响应并返回结构化的世界观数据
    return {
      geography: '从响应中解析',
      politicalSystem: '从响应中解析',
      cultivationLevel: '从响应中解析',
      currencySystem: '从响应中解析',
      cultureBackground: '从响应中解析',
      timeline: []
    }
  }

  // 生成关系图谱
  async function generateRelationshipMap(characters: any[], seedDescription: string): Promise<any> {
    const prompt = `
    基于以下角色和背景创建人物关系图谱:

    背景: ${seedDescription}

    角色列表:
    ${characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}

    请定义他们之间的关系，如:
    - 师徒关系
    - 仇恨关系
    - 友谊关系
    - 恋爱关系
    - 家族关系
    - 势力归属
    - 其他特殊关系

    请为每种关系指定强度和性质。
    `

    const response = await aiStore.generateContent(prompt)

    // 解析响应并创建关系图谱
    return {
      nodes: characters.map(c => ({
        id: c.id,
        label: c.name,
        type: 'character',
        properties: c.properties
      })),
      edges: [] // 从响应中解析关系
    }
  }

  // 批量内容生成
  async function batchGenerate(prompts: string[]): Promise<AiResponse[]> {
    const results: AiResponse[] = []

    for (const [index, prompt] of prompts.entries()) {
      try {
        const response = await aiStore.generateContent(prompt)
        results.push(response)

        // 更新进度（如果有的话）
        if (typeof window !== 'undefined') {
          // 可以在这里更新UI进度条
        }
      } catch (error) {
        console.error(`批量生成第${index + 1}个项目时出错:`, error)
        // 根据需要决定是否继续或抛出错误
      }
    }

    return results
  }

  return {
    generateCharacter,
    generateStoryChunk,
    approveContent,
    optimizeWorldSetting,
    generateRelationshipMap,
    batchGenerate
  }
}
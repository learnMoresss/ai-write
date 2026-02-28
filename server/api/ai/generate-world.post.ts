// server/api/ai/generate-world.post.ts
import { createOpenAI } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages } from 'ai'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body) {
    throw createError({
      statusCode: 400,
      message: 'Request body is required'
    })
  }

  // 验证请求体
  const requestSchema = z.object({
    seed: z.string().min(1, 'Seed is required'),
    focusAreas: z.array(z.string()).optional(),
    expansionLevel: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),
    customInstructions: z.string().optional()
  })

  try {
    const validated = requestSchema.parse(body)

    // 获取AI设置
    const config = useRuntimeConfig()
    const openai = createOpenAI({
      apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY
    })

    // 构建提示
    let prompt = `你是一个专业的小说世界观构建师。根据用户提供的种子概念 "${validated.seed}" 创建一个详细的世界观。`

    if (validated.focusAreas && validated.focusAreas.length > 0) {
      prompt += `特别关注以下方面: ${validated.focusAreas.join(', ')}。`
    }

    if (validated.expansionLevel === 'basic') {
      prompt += '提供基本的世界观设定，包括地理、政治、文化等主要要素。'
    } else if (validated.expansionLevel === 'detailed') {
      prompt += '提供详细的世界观设定，包括地理环境、政治体系、修炼或科技体系、文化背景、法律法规、特殊要素等。'
    } else {
      prompt += '提供全面的世界观设定，涵盖所有细节，包括地理、政治、经济、文化、法律、社会、宗教、科技、魔法体系等方面。'
    }

    if (validated.customInstructions) {
      prompt += `额外要求: ${validated.customInstructions}`
    }

    prompt += `
    请以JSON格式返回以下结构的世界观信息：
    {
      "id": "生成的UUID",
      "name": "世界观名称",
      "description": "世界观的总体描述",
      "geography": "地理环境描述",
      "politicalSystem": "政治体系描述",
      "cultivationSystem": "修炼体系（如果适用）",
      "magicSystem": "魔法体系（如果适用）",
      "technologyLevel": "科技水平（如果适用）",
      "economicSystem": "经济体系",
      "culturalBackground": "文化背景",
      "lawsOfNature": "自然法则",
      "uniqueFeatures": ["独特特性列表"],
      "createdAt": "ISO日期字符串",
      "updatedAt": "ISO日期字符串"
    }
    `

    // 调用AI生成
    const result = await streamText({
      model: openai('gpt-4o'),
      prompt: prompt,
      maxTokens: 2048,
      temperature: 0.7
    })

    // 等待完成并获取文本
    const response = await result.text()

    // 尝试解析AI返回的JSON
    let worldData
    try {
      // 提取JSON部分（以防AI在响应前后添加了其他文本）
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        worldData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('AI未返回有效的JSON格式')
      }
    } catch (parseError) {
      console.error('JSON解析错误:', parseError)
      console.log('AI响应:', response)
      throw createError({
        statusCode: 500,
        message: '无法解析AI生成的世界观数据'
      })
    }

    return {
      data: worldData,
      message: 'World generated successfully'
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request body: ' + error.errors.map(e => e.message).join(', ')
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while generating the world'
    })
  }
})
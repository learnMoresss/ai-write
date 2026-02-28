// server/api/ai/generate-character.post.ts
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
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
    concept: z.string().min(1, 'Character concept is required'),
    roleType: z.enum(['protagonist', 'antagonist', 'supporting', 'neutral']).optional(),
    relationshipToProtagonist: z.string().optional(),
    worldContext: z.any().optional(),
    customAttributes: z.array(z.string()).optional()
  })

  try {
    const validated = requestSchema.parse(body)

    // 获取AI设置
    const config = useRuntimeConfig()
    const openai = createOpenAI({
      apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY
    })

    // 构建提示
    let prompt = `你是一个专业的角色设计师。请创建一个符合以下概念的角色："${validated.concept}"`

    if (validated.roleType) {
      prompt += `。该角色在故事中的作用是：${validated.roleType}。`
    }

    if (validated.worldContext) {
      prompt += `。角色所处的世界观：${JSON.stringify(validated.worldContext).substring(0, 500)}...。`
    }

    if (validated.relationshipToProtagonist) {
      prompt += `。该角色与主角的关系：${validated.relationshipToProtagonist}。`
    }

    if (validated.customAttributes && validated.customAttributes.length > 0) {
      prompt += `。角色应具备以下特质：${validated.customAttributes.join(', ')}。`
    }

    prompt += `
    请以JSON格式返回以下结构的角色信息：
    {
      "id": "生成的UUID",
      "name": "角色姓名",
      "type": "character",
      "label": "角色标签",
      "properties": {
        "name": "角色姓名",
        "age": "年龄",
        "gender": "性别",
        "role": "角色类型（主角、反派、配角等）",
        "personality": "性格特点",
        "abilities": ["能力列表"],
        "relationships": ["关系描述"],
        "powerLevel": "战力等级（0-100）",
        "status": "状态（alive/dead/unknown）",
        "background": "背景故事",
        "motivations": "动机",
        "flaws": "缺陷"
      },
      "position": {
        "x": "X坐标",
        "y": "Y坐标"
      },
      "category": "分类",
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
    let characterData
    try {
      // 提取JSON部分（以防AI在响应前后添加了其他文本）
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        characterData = JSON.parse(jsonMatch[0])

        // 设置默认值
        if (!characterData.id) {
          characterData.id = crypto.randomUUID()
        }
        if (!characterData.createdAt) {
          characterData.createdAt = new Date().toISOString()
        }
        if (!characterData.updatedAt) {
          characterData.updatedAt = new Date().toISOString()
        }
        if (!characterData.position) {
          characterData.position = { x: Math.random() * 400, y: Math.random() * 300 }
        }
      } else {
        throw new Error('AI未返回有效的JSON格式')
      }
    } catch (parseError) {
      console.error('JSON解析错误:', parseError)
      console.log('AI响应:', response)
      throw createError({
        statusCode: 500,
        message: '无法解析AI生成的角色数据'
      })
    }

    return {
      data: characterData,
      message: 'Character generated successfully'
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
      message: error.message || 'An error occurred while generating the character'
    })
  }
})
// server/api/ai/generate-story-chunk.post.ts
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
    context: z.object({
      worldSetting: z.any(),
      currentEntities: z.array(z.any()),
      currentTimeline: z.array(z.any()),
      previousContent: z.string().optional(),
      nextPlotPoint: z.string().optional()
    }),
    length: z.number().optional().default(1000),
    style: z.string().optional(),
    pov: z.string().optional(),
    tone: z.string().optional()
  })

  try {
    const validated = requestSchema.parse(body)

    // 获取AI设置
    const config = useRuntimeConfig()
    const openai = createOpenAI({
      apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY
    })

    // 构建提示
    let prompt = `你是一个专业的小说作家，擅长根据给定的世界观和角色信息创作连贯的故事情节。`

    prompt += `\n\n世界观设定：${JSON.stringify(validated.context.worldSetting).substring(0, 800)}...`

    prompt += `\n\n当前角色列表：${validated.context.currentEntities.map(e => e.label || e.name).join(', ')}`

    if (validated.context.previousContent) {
      prompt += `\n\n前面的内容：${validated.context.previousContent.substring(0, 600)}...`
    }

    if (validated.context.nextPlotPoint) {
      prompt += `\n\n下一个情节要点：${validated.context.nextPlotPoint}`
    }

    if (validated.style) {
      prompt += `\n\n写作风格要求：${validated.style}`
    }

    if (validated.pov) {
      prompt += `\n\n视角要求：${validated.pov}`
    }

    if (validated.tone) {
      prompt += `\n\n语调要求：${validated.tone}`
    }

    prompt += `\n\n请生成大约${validated.length}字左右的故事情节，保持与世界观和角色设定的一致性，确保情节连贯，人物行为符合其性格特点。`

    prompt += `
    请以JSON格式返回以下结构的响应：
    {
      "content": "生成的故事内容",
      "tokensUsed": "使用的token数量",
      "processingTime": "处理时间（毫秒）",
      "entitiesReferenced": ["涉及的角色ID列表"],
      "locationsReferenced": ["涉及的地点列表"],
      "continuityNotes": "与前文的连贯性说明"
    }
    `

    // 调用AI生成
    const startTime = Date.now()
    const result = await streamText({
      model: openai('gpt-4o'),
      prompt: prompt,
      maxTokens: validated.length || 1500,
      temperature: 0.7
    })

    // 等待完成并获取文本
    const response = await result.text()
    const processingTime = Date.now() - startTime

    // 尝试解析AI返回的JSON
    let storyChunkData
    try {
      // 提取JSON部分（以防AI在响应前后添加了其他文本）
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        storyChunkData = JSON.parse(jsonMatch[0])

        // 确保内容字段存在
        if (!storyChunkData.content) {
          // 如果解析失败，将整个响应作为内容
          storyChunkData.content = response.replace(/\{[\s\S]*\}/, '').trim()
        }
      } else {
        // 如果没有JSON结构，直接将响应作为内容返回
        storyChunkData = {
          content: response,
          tokensUsed: response.length / 4, // 估算token数量
          processingTime: processingTime,
          entitiesReferenced: [],
          locationsReferenced: [],
          continuityNotes: '未提供连贯性说明'
        }
      }
    } catch (parseError) {
      console.error('JSON解析错误:', parseError)
      console.log('AI响应:', response)

      // 返回纯内容
      storyChunkData = {
        content: response,
        tokensUsed: response.length / 4, // 估算token数量
        processingTime: processingTime,
        entitiesReferenced: [],
        locationsReferenced: [],
        continuityNotes: '无法解析详细信息'
      }
    }

    return {
      data: storyChunkData,
      message: 'Story chunk generated successfully'
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
      message: error.message || 'An error occurred while generating the story chunk'
    })
  }
})
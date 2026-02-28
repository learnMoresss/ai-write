// server/api/ai/approve-content.post.ts
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
    content: z.string().min(1, 'Content is required'),
    context: z.object({
      worldSetting: z.any(),
      entities: z.array(z.any()),
      relationships: z.array(z.any()),
      previousContent: z.string().optional(),
      currentTimeline: z.array(z.any()).optional()
    }).optional(),
    checks: z.array(z.enum(['consistency', 'logic', 'continuity', 'lore-adherence']))
  })

  try {
    const validated = requestSchema.parse(body)

    // 获取AI设置
    const config = useRuntimeConfig()
    const openai = createOpenAI({
      apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY
    })

    // 构建提示
    let prompt = `你是一个专业的内容质量审核员，负责检查小说内容的质量和一致性。请仔细检查以下内容：\n\n"${validated.content}"\n\n`

    if (validated.context) {
      prompt += `审核上下文：\n`

      if (validated.context.worldSetting) {
        prompt += `- 世界观设定：${JSON.stringify(validated.context.worldSetting).substring(0, 500)}...\n`
      }

      if (validated.context.entities && validated.context.entities.length > 0) {
        prompt += `- 角色列表：${validated.context.entities.map(e => e.label || e.name).join(', ')}\n`
      }

      if (validated.context.relationships && validated.context.relationships.length > 0) {
        prompt += `- 关系网络：${validated.context.relationships.map(r => `${r.source}-${r.relation}-${r.target}`).join('; ')}\n`
      }

      if (validated.context.previousContent) {
        prompt += `- 前文内容：${validated.context.previousContent.substring(0, 300)}...\n`
      }
    }

    prompt += `\n请根据以下要求进行审核：\n`

    if (validated.checks.includes('consistency')) {
      prompt += `- 一致性：检查内容是否与之前的信息保持一致，包括角色行为、世界观设定、已建立的事实等。\n`
    }

    if (validated.checks.includes('logic')) {
      prompt += `- 逻辑性：检查内容是否合乎逻辑，包括时间顺序、因果关系、物理规则（在世界观允许的范围内）等。\n`
    }

    if (validated.checks.includes('continuity')) {
      prompt += `- 连续性：检查内容是否与前文连贯，没有时间跳跃、地点突变或其他连续性错误。\n`
    }

    if (validated.checks.includes('lore-adherence')) {
      prompt += `- 设定遵循度：检查内容是否遵循既定的世界观设定和规则，包括魔法系统、科技水平、社会结构等。\n`
    }

    prompt += `
    请以JSON格式返回审核结果：
    {
      "approved": true/false,
      "issues": [
        {
          "type": "continuity|consistency|logic|lore|character|timeline",
          "severity": "low|medium|high|critical",
          "description": "问题描述",
          "location": "问题所在位置",
          "suggestedFix": "建议修复方式"
        }
      ],
      "suggestions": ["改进建议列表"],
      "confidence": 0-1之间的置信度分数,
      "overallFeedback": "总体反馈意见"
    }
    `

    // 调用AI进行审核
    const result = await streamText({
      model: openai('gpt-4o'),
      prompt: prompt,
      maxTokens: 1024,
      temperature: 0.3 // 使用较低的温度以获得更一致的审核结果
    })

    // 等待完成并获取文本
    const response = await result.text()

    // 尝试解析AI返回的JSON
    let approvalResult
    try {
      // 提取JSON部分（以防AI在响应前后添加了其他文本）
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        approvalResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('AI未返回有效的JSON格式')
      }
    } catch (parseError) {
      console.error('JSON解析错误:', parseError)
      console.log('AI响应:', response)

      // 如果解析失败，返回默认的审核结果
      approvalResult = {
        approved: false,
        issues: [{
          type: 'parsing-error',
          severity: 'critical',
          description: '无法解析AI审核结果',
          location: 'system',
          suggestedFix: '重新提交审核请求'
        }],
        suggestions: ['重新提交审核请求'],
        confidence: 0,
        overallFeedback: '由于解析错误，审核失败'
      }
    }

    return {
      data: approvalResult,
      message: 'Content approval completed'
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
      message: error.message || 'An error occurred while approving the content'
    })
  }
})
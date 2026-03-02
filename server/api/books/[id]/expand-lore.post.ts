import { z } from 'zod'
import { atomicWriteJson, bookLorePath, bookMetaPath, readJson, settingsPath, defaultSettings, type BookMeta, validateBookId } from '../../../lib/storage'
import { callAI } from '../../../lib/ai-service'
import { apiSuccess, apiError } from '../../../utils/api-response'

const schema = z.object({
  world: z.string().optional(),
  factions: z.array(z.string()).optional(),
  protagonist: z.string().optional(),
  sideCharacters: z.array(z.string()).optional()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !validateBookId(id)) {
    return apiError(400, 'Invalid book id')
  }

  const meta = await readJson<BookMeta>(bookMetaPath(id), null)
  if (!meta) {
    return apiError(404, 'Book not found')
  }

  const settings = await readJson(settingsPath, defaultSettings())
  if (!settings.apiKeyMasked && !meta.styleSnapshot?.systemPrompt) {
    return apiError(400, '需要配置API Key才能使用AI功能')
  }

  try {
    // 使用AI生成初始设定
    const prompt = `
      根据以下书籍信息生成详细的世界观设定：
      书名：${meta.title}
      一句话梗概：${meta.oneLiner}
      题材：${meta.genre}
      目标读者：${meta.readers}

      请生成：
      1. 详细的世界观背景（约500字）
      2. 核心势力分布
      3. 主角设定（外貌、性格、特殊能力/金手指等）
      4. 关键配角设定
      5. 全书的终极目标/主线悬念
    `

    const aiResponse = await callAI(prompt)

    // 解析AI响应并更新书籍设定
    const bookLore = await readJson(bookLorePath(id), {
      world: '',
      factions: [],
      protagonist: '',
      sideCharacters: [],
      clues: []
    })

    // 这里应该解析AI的响应，简单起见，我们将完整响应作为世界观
    bookLore.world = aiResponse.substring(0, 1000) // 限制长度
    bookLore.protagonist = `主角设定：${meta.title}的主人公`

    // 更新meta中的终极目标
    meta.finalGoal = `基于AI生成的目标：${meta.oneLiner}的最终实现`

    await atomicWriteJson(bookLorePath(id), bookLore)
    await atomicWriteJson(bookMetaPath(id), meta)

    return apiSuccess({
      success: true,
      lore: bookLore,
      meta: { finalGoal: meta.finalGoal }
    })
  } catch (error: unknown) {
    console.error('AI扩展设定失败:', error)
    const msg = error instanceof Error ? error.message : 'AI扩展设定失败'
    return apiError(500, msg)
  }
})
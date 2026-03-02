import { readJson, bookMetaPath, bookOutlinePath, chapterPath, validateBookId } from '../../../lib/storage'
import { readWorkspace } from '../../../lib/book-engine'
import { apiSuccess, apiError } from '../../../utils/api-response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !validateBookId(id)) {
    return apiError(400, 'Invalid book id')
  }

  try {
    const { meta, lore, outline } = await readWorkspace(id)

    // 计算总字数
    let totalWordCount = 0
    let completedChapters = 0

    for (const node of outline) {
      if (node.status === 'generated') {
        const chapterFilePath = chapterPath(id, node.chapterId)
        try {
          const chapter = await readJson<any>(chapterFilePath, null)
          if (chapter && chapter.wordCount) {
            totalWordCount += chapter.wordCount
          }
          completedChapters++
        } catch (e) {
          // 如果章节文件不存在，跳过
          console.warn(`章节文件不存在: ${chapterFilePath}`)
        }
      }
    }

    // 计算进度百分比
    let progress = 0
    if (meta && meta.targetWords && meta.targetWords > 0) {
      progress = Math.min(100, Math.round((totalWordCount / meta.targetWords) * 100))
    }

    // 统计伏笔状态
    const clueStats = {
      total: lore.clues.length,
      pending: lore.clues.filter((c: any) => c.status === 'pending').length,
      resolved: lore.clues.filter((c: any) => c.status === 'resolved').length
    }

    // 统计大纲状态
    const outlineStats = {
      total: outline.length,
      planned: outline.filter((n: any) => n.status === 'planned').length,
      locked: outline.filter((n: any) => n.status === 'locked').length,
      generating: outline.filter((n: any) => n.status === 'generating').length,
      generated: outline.filter((n: any) => n.status === 'generated').length,
      failed: outline.filter((n: any) => n.status === 'failed').length
    }

    return apiSuccess({
      progress,
      totalWordCount,
      completedChapters,
      clueStats,
      outlineStats,
      updatedAt: meta?.updatedAt || new Date().toISOString()
    })
  } catch (error: unknown) {
    console.error('获取书籍统计失败:', error)
    const msg = error instanceof Error ? error.message : '获取书籍统计失败'
    return apiError(500, msg)
  }
})
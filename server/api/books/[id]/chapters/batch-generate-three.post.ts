import { generateChapterDraft } from '../../../../lib/book-engine'
import { validateBookId } from '../../../../lib/storage'
import { apiSuccess, apiError } from '../../../../utils/api-response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !validateBookId(id)) {
    return apiError(400, 'Invalid book id')
  }

  const queue = ['ch_001', 'ch_002', 'ch_003']
  const generated = []

  try {
    for (const chapterId of queue) {
      const chapter = await generateChapterDraft(id, chapterId)
      generated.push(chapter)
    }
    return apiSuccess({ queue, generated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '批量生成失败'
    return apiError(500, msg)
  }
})

import { generateChapterDraft } from '../../../../../lib/book-engine'
import { validateBookId } from '../../../../../lib/storage'
import { apiSuccess, apiError } from '../../../../../utils/api-response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const chapterId = getRouterParam(event, 'chapterId')
  if (!id || !validateBookId(id) || !chapterId) {
    return apiError(400, 'Invalid params')
  }

  try {
    const data = await generateChapterDraft(id, chapterId)
    return apiSuccess(data)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '生成失败'
    return apiError(500, msg)
  }
})

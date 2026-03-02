import { chapterPath, readJson, type ChapterData, validateBookId } from '../../../../lib/storage'
import { apiSuccess, apiError } from '../../../../utils/api-response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const chapterId = getRouterParam(event, 'chapterId')
  if (!id || !validateBookId(id) || !chapterId) {
    return apiError(400, 'Invalid params')
  }

  const chapter = await readJson<ChapterData | null>(chapterPath(id, chapterId), null)
  if (!chapter) return apiError(404, 'Chapter not found')
  return apiSuccess(chapter)
})

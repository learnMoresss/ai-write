import { generateChapterDraft } from '../../../../../lib/book-engine'
import { validateBookId } from '../../../../../lib/storage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const chapterId = getRouterParam(event, 'chapterId')
  if (!id || !validateBookId(id) || !chapterId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid params' })
  }

  const data = await generateChapterDraft(id, chapterId)
  return { data }
})

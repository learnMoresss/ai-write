import { chapterPath, readJson, type ChapterData, validateBookId } from '../../../../lib/storage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const chapterId = getRouterParam(event, 'chapterId')
  if (!id || !validateBookId(id) || !chapterId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid params' })
  }

  const chapter = await readJson<ChapterData | null>(chapterPath(id, chapterId), null)
  if (!chapter) throw createError({ statusCode: 404, statusMessage: 'Chapter not found' })
  return { data: chapter }
})

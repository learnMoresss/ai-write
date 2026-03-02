import { bookOutlinePath, chapterPath, readJson, type ChapterData, type OutlineNode, validateBookId } from '../../../lib/storage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !validateBookId(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid book id' })
  }

  const outline = await readJson<OutlineNode[]>(bookOutlinePath(id), [])
  const chapters = []

  for (const node of outline) {
    const chapter = await readJson<ChapterData | null>(chapterPath(id, node.chapterId), null)
    if (!chapter) continue
    chapters.push({
      chapterId: chapter.chapterId,
      title: chapter.title,
      content: chapter.content,
      wordCount: chapter.wordCount
    })
  }

  return { data: { chapters } }
})

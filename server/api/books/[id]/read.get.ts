import { bookOutlinePath, chapterPath, readJson, type ChapterData, type OutlineNode, validateBookId } from '../../../lib/storage'
import { apiSuccess, apiError } from '../../../utils/api-response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !validateBookId(id)) {
    return apiError(400, 'Invalid book id')
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

  return apiSuccess({ chapters })
})

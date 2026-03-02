import { generateChapterDraft } from '../../../../lib/book-engine'
import { validateBookId } from '../../../../lib/storage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !validateBookId(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid book id' })
  }

  const queue = ['ch_001', 'ch_002', 'ch_003']
  const generated = []

  for (const chapterId of queue) {
    const chapter = await generateChapterDraft(id, chapterId)
    generated.push(chapter)
  }

  return { data: { queue, generated } }
})

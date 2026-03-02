import { z } from 'zod'
import { atomicWriteJson, chapterPath, readJson, type ChapterData, validateBookId } from '../../../../lib/storage'
import { apiSuccess, apiError } from '../../../../utils/api-response'

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const chapterId = getRouterParam(event, 'chapterId')
  if (!id || !validateBookId(id) || !chapterId) {
    return apiError(400, 'Invalid params')
  }

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, parsed.error.issues.map(x => x.message).join(', '))
  }

  const current = await readJson<ChapterData | null>(chapterPath(id, chapterId), null)
  if (!current) return apiError(404, 'Chapter not found')

  const next: ChapterData = {
    chapterId,
    title: parsed.data.title,
    content: parsed.data.content,
    wordCount: parsed.data.content.replace(/\s+/g, '').length,
    updatedAt: new Date().toISOString()
  }

  await atomicWriteJson(chapterPath(id, chapterId), next)
  return apiSuccess(next)
})

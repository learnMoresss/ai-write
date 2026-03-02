import { z } from 'zod'
import { atomicWriteJson, bookLorePath, bookMetaPath, bookOutlinePath, createBookId, readJson, stylesPath, type BookMeta, type StylePreset } from '../../lib/storage'
import { defaultLore } from '../../lib/book-engine'
import { apiSuccess, apiError } from '../../utils/api-response'

const schema = z.object({
  title: z.string().min(1),
  oneLiner: z.string().default(''),
  genre: z.string().default('未分类'),
  readers: z.string().default('大众'),
  targetWords: z.number().int().positive().default(120000),
  pace: z.string().default('normal'),
  styleId: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, parsed.error.issues.map(x => x.message).join(', '))
  }

  const now = new Date().toISOString()
  const id = createBookId()
  const styles = await readJson<StylePreset[]>(stylesPath, [])
  const styleSnapshot = styles.find(x => x.id === parsed.data.styleId) ?? styles.find(x => x.isDefault) ?? null

  const meta: BookMeta = {
    id,
    title: parsed.data.title,
    oneLiner: parsed.data.oneLiner,
    genre: parsed.data.genre,
    readers: parsed.data.readers,
    targetWords: parsed.data.targetWords,
    pace: parsed.data.pace,
    styleSnapshot,
    finalGoal: '',
    createdAt: now,
    updatedAt: now
  }

  await atomicWriteJson(bookMetaPath(id), meta)
  await atomicWriteJson(bookLorePath(id), defaultLore())
  await atomicWriteJson(bookOutlinePath(id), [])
  return apiSuccess({ id })
})

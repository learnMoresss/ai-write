import { z } from 'zod'
import { atomicWriteJson, readJson, stylesPath, type StylePreset } from '../../lib/storage'
import { apiSuccess, apiError } from '../../utils/api-response'

const schema = z.object({
  name: z.string().min(1),
  systemPrompt: z.string().default(''),
  vocabulary: z.array(z.string()).default([]),
  prohibitedWords: z.array(z.string()).default([]),
  isDefault: z.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, parsed.error.issues.map(x => x.message).join(', '))
  }

  const current = await readJson<StylePreset[]>(stylesPath, [])
  const item: StylePreset = {
    id: `style_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...parsed.data
  }

  let next = [...current, item]
  if (item.isDefault) {
    next = next.map(x => ({ ...x, isDefault: x.id === item.id }))
  }

  await atomicWriteJson(stylesPath, next)
  return apiSuccess(item)
})

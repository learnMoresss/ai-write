import { z } from 'zod'
import { atomicWriteJson, readJson, stylesPath, type StylePreset } from '../../lib/storage'
import { apiSuccess, apiError } from '../../utils/api-response'

const schema = z.object({
  name: z.string().min(1).optional(),
  systemPrompt: z.string().optional(),
  vocabulary: z.array(z.string()).optional(),
  prohibitedWords: z.array(z.string()).optional(),
  isDefault: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) return apiError(400, 'Missing style id')

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, parsed.error.issues.map(x => x.message).join(', '))
  }

  const current = await readJson<StylePreset[]>(stylesPath, [])
  const index = current.findIndex(x => x.id === id)
  if (index < 0) return apiError(404, 'Style not found')

  const existing = current[index]
  if (!existing) return apiError(404, 'Style not found')
  current[index] = {
    id: existing.id,
    name: parsed.data.name ?? existing.name,
    systemPrompt: parsed.data.systemPrompt ?? existing.systemPrompt,
    vocabulary: parsed.data.vocabulary ?? existing.vocabulary,
    prohibitedWords: parsed.data.prohibitedWords ?? existing.prohibitedWords,
    isDefault: parsed.data.isDefault ?? existing.isDefault
  }
  if (parsed.data.isDefault) {
    for (const item of current) item.isDefault = item.id === id
  }

  await atomicWriteJson(stylesPath, current)
  return apiSuccess(current[index])
})

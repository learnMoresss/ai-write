import { z } from 'zod'
import { atomicWriteJson, defaultSettings, readJson, settingsPath, type SettingsData } from '../lib/storage'

const schema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  apiKeyMasked: z.string().default(''),
  theme: z.enum(['light', 'dark'])
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues.map(x => x.message).join(', ') })
  }

  const current = await readJson<SettingsData>(settingsPath, defaultSettings())
  const next = { ...current, ...parsed.data }
  await atomicWriteJson(settingsPath, next)
  return { data: next }
})

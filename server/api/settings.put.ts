import { z } from 'zod'
import { atomicWriteJson, defaultSettings, readJson, settingsPath, type SettingsData } from '../lib/storage'
import { apiSuccess, apiError } from '../utils/api-response'

const schema = z.object({
  provider: z.string().optional(),
  model: z.string().optional(),
  apiKeyMasked: z.string().optional(),
  theme: z.enum(['light', 'dark']).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, parsed.error.issues.map(x => x.message).join(', '))
  }

  const current = await readJson<SettingsData>(settingsPath, defaultSettings())
  const updateData = parsed.data

  const next: SettingsData = {
    provider: updateData.provider ?? current.provider,
    model: updateData.model ?? current.model,
    apiKeyMasked: updateData.apiKeyMasked !== undefined ? updateData.apiKeyMasked : current.apiKeyMasked,
    theme: updateData.theme ?? current.theme
  }

  await atomicWriteJson(settingsPath, next)
  return apiSuccess(next)
})

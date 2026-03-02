import { defaultSettings, readJson, settingsPath } from '../lib/storage'
import { apiSuccess } from '../utils/api-response'

// 辅助函数：掩码API密钥
const maskApiKey = (key: string): string => {
  if (!key) return ''
  const len = key.length
  if (len <= 8) return '*'.repeat(len)
  return key.substring(0, 2) + '*'.repeat(len - 4) + key.substring(len - 2)
}

export default defineEventHandler(async () => {
  const data = await readJson(settingsPath, defaultSettings())
  return apiSuccess({
    ...data,
    apiKeyMasked: maskApiKey(data.apiKeyMasked)
  })
})

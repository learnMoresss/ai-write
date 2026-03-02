import { defaultSettings, readJson, settingsPath } from '../lib/storage'

export default defineEventHandler(async () => {
  const data = await readJson(settingsPath, defaultSettings())
  return { data }
})

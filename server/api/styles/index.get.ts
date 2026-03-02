import { readJson, stylesPath, type StylePreset } from '../../lib/storage'
import { apiSuccess } from '../../utils/api-response'

export default defineEventHandler(async () => {
  const data = await readJson<StylePreset[]>(stylesPath, [])
  return apiSuccess(data)
})

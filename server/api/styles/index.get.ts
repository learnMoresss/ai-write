import { readJson, stylesPath, type StylePreset } from '../../lib/storage'

export default defineEventHandler(async () => {
  const data = await readJson<StylePreset[]>(stylesPath, [])
  return { data }
})

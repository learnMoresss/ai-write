import { atomicWriteJson, readJson, stylesPath, type StylePreset } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing style id' })

  const current = await readJson<StylePreset[]>(stylesPath, [])
  const next = current.filter(x => x.id !== id)
  if (next.length === current.length) throw createError({ statusCode: 404, statusMessage: 'Style not found' })

  await atomicWriteJson(stylesPath, next)
  return { data: { success: true } }
})

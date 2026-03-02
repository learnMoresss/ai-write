import { atomicWriteJson, readJson, stylesPath } from '../../lib/storage'
import { apiSuccess, apiError } from '../../utils/api-response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) return apiError(400, 'Missing style id')

  const current = await readJson(stylesPath, [])
  const next = current.filter((x: { id: string }) => x.id !== id)
  if (next.length === current.length) return apiError(404, 'Style not found')

  await atomicWriteJson(stylesPath, next)
  return apiSuccess({ success: true })
})

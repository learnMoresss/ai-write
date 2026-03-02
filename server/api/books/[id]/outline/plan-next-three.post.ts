import { ensureOutlineThree } from '../../../../lib/book-engine'
import { atomicWriteJson, bookMetaPath, readBookMeta, validateBookId } from '../../../../lib/storage'
import { apiSuccess, apiError } from '../../../../utils/api-response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !validateBookId(id)) {
    return apiError(400, 'Invalid book id')
  }

  const meta = await readBookMeta(id)
  if (!meta) return apiError(404, 'Book not found')

  const data = await ensureOutlineThree(id)
  meta.updatedAt = new Date().toISOString()
  await atomicWriteJson(bookMetaPath(id), meta)
  return apiSuccess(data)
})

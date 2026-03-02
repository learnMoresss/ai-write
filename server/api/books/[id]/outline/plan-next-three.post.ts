import { ensureOutlineThree } from '../../../../lib/book-engine'
import { atomicWriteJson, bookMetaPath, readBookMeta, validateBookId } from '../../../../lib/storage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !validateBookId(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid book id' })
  }

  const meta = await readBookMeta(id)
  if (!meta) throw createError({ statusCode: 404, statusMessage: 'Book not found' })

  const data = await ensureOutlineThree(id)
  meta.updatedAt = new Date().toISOString()
  await atomicWriteJson(bookMetaPath(id), meta)
  return { data }
})

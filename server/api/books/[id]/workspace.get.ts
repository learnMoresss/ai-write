import { readWorkspace } from '../../../lib/book-engine'
import { validateBookId } from '../../../lib/storage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !validateBookId(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid book id' })
  }

  const data = await readWorkspace(id)
  if (!data.meta) throw createError({ statusCode: 404, statusMessage: 'Book not found' })
  return { data }
})

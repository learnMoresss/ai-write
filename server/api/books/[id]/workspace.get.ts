import { readWorkspace } from '../../../lib/book-engine'
import { validateBookId } from '../../../lib/storage'
import { apiSuccess, apiError } from '../../../utils/api-response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !validateBookId(id)) {
    return apiError(400, 'Invalid book id')
  }

  const data = await readWorkspace(id)
  if (!data.meta) return apiError(404, 'Book not found')
  return apiSuccess(data)
})

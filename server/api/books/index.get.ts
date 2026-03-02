import { listBooks } from '../../lib/storage'
import { apiSuccess } from '../../utils/api-response'

export default defineEventHandler(async () => {
  const books = await listBooks()
  const data = books.map(book => ({
    id: book.id,
    title: book.title,
    genre: book.genre,
    targetWords: book.targetWords,
    updatedAt: book.updatedAt
  }))
  return apiSuccess(data)
})

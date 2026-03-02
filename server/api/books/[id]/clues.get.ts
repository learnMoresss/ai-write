import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { apiSuccess, apiError } from '../../../utils/api-response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const bookDir = join(process.cwd(), 'server', 'data', 'books', `book_${id}`)

  if (!existsSync(bookDir)) {
    return apiError(404, '书籍不存在')
  }

  const lorePath = join(bookDir, 'lore.json')
  let lore: { clues?: { status?: string }[] } = {}
  if (existsSync(lorePath)) {
    lore = JSON.parse(await readFile(lorePath, 'utf-8'))
  }

  const clues = lore.clues || []
  const pendingClues = clues.filter((c: { status?: string }) => c.status === 'pending')
  const resolvedClues = clues.filter((c: { status?: string }) => c.status === 'resolved')

  return apiSuccess({
    pending: pendingClues,
    resolved: resolvedClues,
    total: clues.length
  })
})
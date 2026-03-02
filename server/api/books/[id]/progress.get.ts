import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { readFile, readdir } from 'node:fs/promises'
import { apiSuccess, apiError } from '../../../utils/api-response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const bookDir = join(process.cwd(), 'server', 'data', 'books', `book_${id}`)

  if (!existsSync(bookDir)) {
    return apiError(404, '书籍不存在')
  }

  const metaPath = join(bookDir, 'meta.json')
  const meta = JSON.parse(await readFile(metaPath, 'utf-8'))

  const outlinePath = join(bookDir, 'outline.json')
  let outline: unknown[] = []
  if (existsSync(outlinePath)) {
    outline = JSON.parse(await readFile(outlinePath, 'utf-8'))
  }

  const chaptersDir = join(bookDir, 'chapters')
  const chapters: { wordCount?: number }[] = []
  if (existsSync(chaptersDir)) {
    const chapterFiles = await readdir(chaptersDir)
    for (const file of chapterFiles) {
      if (file.endsWith('.json')) {
        const chapterPath = join(chaptersDir, file)
        const chapter = JSON.parse(await readFile(chapterPath, 'utf-8'))
        chapters.push(chapter)
      }
    }
  }

  // 计算进度
  const totalTargetWords = meta.targetWords || 100000
  const currentWords = chapters.reduce((sum, chapter) => sum + (chapter.wordCount || 0), 0)
  const progressPercentage = totalTargetWords > 0 ? Math.min(100, (currentWords / totalTargetWords) * 100) : 0

  // 统计大纲和章节状态
  const plannedChapters = outline.length
  const writtenChapters = chapters.length
  const lockedChapters = outline.filter((node: { status?: string }) => node.status === 'locked' || node.status === 'generated').length

  return apiSuccess({
    progress: progressPercentage,
    currentWords,
    targetWords: totalTargetWords,
    chapterStats: {
      planned: plannedChapters,
      written: writtenChapters,
      locked: lockedChapters
    },
    lastUpdated: meta.updatedAt || new Date().toISOString()
  })
})
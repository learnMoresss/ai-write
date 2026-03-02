import { z } from 'zod'
import { atomicWriteJson, bookLorePath, bookOutlinePath, chapterPath, readJson, type LoreData, validateBookId } from '../../../lib/storage'
import { extractChapterSummary, updateCharacterStatus, trackClues } from '../../../lib/ai-service'
import { apiSuccess, apiError } from '../../../utils/api-response'

const schema = z.object({
  chapterId: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!id || !validateBookId(id)) {
    return apiError(400, 'Invalid book id')
  }

  if (!parsed.success) {
    return apiError(400, parsed.error.issues.map(x => x.message).join(', '))
  }

  const { chapterId } = parsed.data

  try {
    const chapter = await readJson<{ content: string } | null>(chapterPath(id, chapterId), null)
    if (!chapter) {
      return apiError(404, 'Chapter not found')
    }

    // 读取当前书籍的lore
    const currentLore = await readJson<LoreData>(bookLorePath(id), {
      world: '',
      factions: [],
      protagonist: '',
      sideCharacters: [],
      clues: []
    })

    const outline = await readJson<{ chapterId: string; characters?: string[] }[]>(bookOutlinePath(id), [])

    // 执行AI分析
    const summary = await extractChapterSummary(chapter.content)

    const outlineNode = outline.find(node => node.chapterId === chapterId)
    const characters = outlineNode?.characters || []
    const characterUpdates = await updateCharacterStatus(chapter.content, characters)

    const existingClueTitles = currentLore.clues?.map(c => c.title) || []
    const clueTracking = await trackClues(chapter.content, existingClueTitles)

    const updatedLore = { ...currentLore }
    if (updatedLore.clues) {
      updatedLore.clues = updatedLore.clues.map(clue => ({
        ...clue,
        status: clueTracking.resolved.includes(clue.title) ? 'resolved' : clue.status
      }))

      const newClues = clueTracking.newClues
        .filter((title: string) => !updatedLore.clues!.some(c => c.title === title))
        .map((title: string) => ({
          id: `clue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          title,
          status: 'pending' as const
        }))

      updatedLore.clues.push(...newClues)
    }

    const updatedOutline = outline.map(node => {
      if (node.chapterId === chapterId) {
        return { ...node, summary }
      }
      return node
    })

    await atomicWriteJson(bookLorePath(id), updatedLore)
    await atomicWriteJson(bookOutlinePath(id), updatedOutline)

    return apiSuccess({
      success: true,
      summary,
      characterUpdates,
      clueTracking,
      updatedLore,
      updatedOutline
    })
  } catch (error: unknown) {
    console.error('章节反刍处理失败:', error)
    const msg = error instanceof Error ? error.message : '章节反刍处理失败'
    return apiError(500, msg)
  }
})
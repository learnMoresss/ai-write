import { atomicWriteJson, bookLorePath, bookMetaPath, bookOutlinePath, chapterPath, readJson, type ChapterData, type LoreData, type OutlineNode } from './storage'
import {
  generateStoryOutline,
  generateChapterContent,
  extractChapterSummary,
  updateCharacterStatus,
  trackClues
} from './ai-service'

export const defaultLore = (): LoreData => ({
  world: '',
  factions: [],
  protagonist: '',
  sideCharacters: [],
  clues: []
})

export const defaultOutline = (): OutlineNode[] => []

export const ensureOutlineThree = async (bookId: string): Promise<OutlineNode[]> => {
  // 获取书籍元数据以构建上下文
  const metaPath = bookMetaPath(bookId)
  const meta = await readJson<any>(metaPath, null)

  if (!meta) {
    throw createError({ statusCode: 404, statusMessage: 'Book not found' })
  }

  // 尝试从lore中获取上下文
  const lore = await readJson<LoreData>(bookLorePath(bookId), defaultLore())

  // 构建AI请求的上下文
  const context = {
    bookTitle: meta.title,
    bookGenre: meta.genre,
    worldSetting: lore.world,
    mainGoal: meta.finalGoal || '未设置终极目标',
    prevOutlines: [] as string[], // 这里可以从前续大纲中获取
    pendingClues: lore.clues?.map((c: any) => c.title) || []
  }

  try {
    // 调用AI生成大纲
    const aiOutline = await generateStoryOutline(
      context.bookTitle,
      context.bookGenre,
      context.worldSetting,
      context.mainGoal,
      context.prevOutlines,
      context.pendingClues
    )

    // 解析AI返回的大纲，这里简化处理，实际需要解析AI返回的具体格式
    const planned: OutlineNode[] = [
      {
        chapterId: 'ch_001',
        chapterTitle: '第一章：AI生成的标题',
        chapterContentOutline: aiOutline.substring(0, 300) + '...', // 简化处理
        characters: ['主角'], // 可以从AI生成的内容中提取
        clues: ['初始核心伏笔'], // 可以从AI生成的内容中提取
        status: 'locked'
      },
      {
        chapterId: 'ch_002',
        chapterTitle: '第二章：AI生成的标题',
        chapterContentOutline: aiOutline.substring(300, 600) + '...', // 简化处理
        characters: ['主角', '关键配角'], // 可以从AI生成的内容中提取
        clues: ['旧伏笔推进'], // 可以从AI生成的内容中提取
        status: 'locked'
      },
      {
        chapterId: 'ch_003',
        chapterTitle: '第三章：AI生成的标题',
        chapterContentOutline: aiOutline.substring(600, 900) + '...', // 简化处理
        characters: ['主角', '关键配角', '潜在对手'], // 可以从AI生成的内容中提取
        clues: ['新伏笔埋设'], // 可以从AI生成的内容中提取
        status: 'locked'
      }
    ]

    await atomicWriteJson(bookOutlinePath(bookId), planned)
    return planned
  } catch (error: any) {
    console.error(`AI大纲生成失败:`, error)

    // 退回到默认模板
    const planned: OutlineNode[] = [
      {
        chapterId: 'ch_001',
        chapterTitle: '第一章：风起之夜',
        chapterContentOutline: '主角第一次直面异常事件，意识到主线冲突已经启动，并留下第一层悬念。',
        characters: ['主角'],
        clues: ['初始核心伏笔'],
        status: 'locked'
      },
      {
        chapterId: 'ch_002',
        chapterTitle: '第二章：暗潮试探',
        chapterContentOutline: '核心势力第一次介入，主角做出代价型选择，冲突从个人扩展到组织层面。',
        characters: ['主角', '关键配角'],
        clues: ['旧伏笔推进'],
        status: 'locked'
      },
      {
        chapterId: 'ch_003',
        chapterTitle: '第三章：线索反噬',
        chapterContentOutline: '伏笔出现反向解释，抛出更大悬念，为下一轮三章滚动规划留下断点。',
        characters: ['主角', '关键配角', '潜在对手'],
        clues: ['新伏笔埋设'],
        status: 'locked'
      }
    ]

    await atomicWriteJson(bookOutlinePath(bookId), planned)
    return planned
  }
}

export const generateChapterDraft = async (bookId: string, chapterId: string): Promise<ChapterData> => {
  const outline = await readJson<OutlineNode[]>(bookOutlinePath(bookId), defaultOutline())
  const node = outline.find(x => x.chapterId === chapterId)
  if (!node) {
    throw createError({ statusCode: 404, statusMessage: `Outline ${chapterId} not found` })
  }

  node.status = 'generating'
  await atomicWriteJson(bookOutlinePath(bookId), outline)

  try {
    // 查找前后章节以提供上下文
    const chapterIndex = outline.findIndex(x => x.chapterId === chapterId)
    let prevChapterEnd: string | undefined
    let nextChapterBrief: string | undefined

    if (chapterIndex > 0) {
      const prevChapter = outline[chapterIndex - 1]
      if (prevChapter.status === 'generated') {
        // 读取前一章的内容结尾部分
        const prevChapterData = await readJson<ChapterData>(chapterPath(bookId, prevChapter.chapterId), {
          chapterId: '',
          title: '',
          content: '',
          wordCount: 0,
          updatedAt: ''
        })
        prevChapterEnd = prevChapterData.content?.slice(-500) // 取最后500个字符
      }
    }

    if (chapterIndex < outline.length - 1) {
      const nextChapter = outline[chapterIndex + 1]
      nextChapterBrief = nextChapter.chapterContentOutline.substring(0, 200) // 取大纲前200字符
    }

    // 尝试从书籍的lore中获取风格信息
    const lore = await readJson<LoreData>(bookLorePath(bookId), defaultLore())
    const styleSystemPrompt = lore.world ? `写作应符合以下世界观：${lore.world}` : undefined

    // 调用AI生成章节内容
    const content = await generateChapterContent(
      node.chapterTitle,
      node.chapterContentOutline,
      styleSystemPrompt,
      prevChapterEnd,
      nextChapterBrief
    )

    const chapter: ChapterData = {
      chapterId,
      title: node.chapterTitle,
      content,
      wordCount: content.replace(/\s+/g, '').length,
      updatedAt: new Date().toISOString()
    }

    await atomicWriteJson(chapterPath(bookId, chapterId), chapter)
    node.status = 'generated'
    await atomicWriteJson(bookOutlinePath(bookId), outline)

    // 章节生成完成后，更新lore信息
    await updateLoreAfterChapterGeneration(bookId, chapter, node)

    return chapter
  } catch (error: any) {
    console.error(`AI章节生成失败:`, error)

    // 如果AI生成失败，使用占位内容
    const content = [
      `${node.chapterTitle}`,
      '',
      `${node.chapterContentOutline}`,
      '',
      '（AI生成失败，此为占位内容）本段用于串联上下章。'
    ].join('\n')

    const chapter: ChapterData = {
      chapterId,
      title: node.chapterTitle,
      content,
      wordCount: content.replace(/\s+/g, '').length,
      updatedAt: new Date().toISOString()
    }

    await atomicWriteJson(chapterPath(bookId, chapterId), chapter)
    node.status = 'failed'
    await atomicWriteJson(bookOutlinePath(bookId), outline)

    throw error
  }
}

/**
 * 章节生成完成后更新lore信息
 */
const updateLoreAfterChapterGeneration = async (
  bookId: string,
  chapter: ChapterData,
  outlineNode: OutlineNode
) => {
  try {
    // 提取章节摘要
    const summary = await extractChapterSummary(chapter.content)
    outlineNode.summary = summary

    // 更新人物状态
    const characterUpdates = await updateCharacterStatus(chapter.content, outlineNode.characters)

    // 追踪伏笔
    const lore = await readJson<LoreData>(bookLorePath(bookId), defaultLore())
    const existingClueTitles = lore.clues?.map((c: any) => c.title) || []
    const clueTracking = await trackClues(chapter.content, existingClueTitles)

    // 更新lore中的伏笔状态
    if (lore.clues) {
      // 标记已解决的伏笔
      lore.clues = lore.clues.map(clue => ({
        ...clue,
        status: clueTracking.resolved.includes(clue.title) ? 'resolved' : clue.status
      }))

      // 添加新的伏笔
      const newClues = clueTracking.newClues
        .filter(title => !lore.clues.some((c: any) => c.title === title))
        .map(title => ({ id: `clue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, title, status: 'pending' as const }))

      lore.clues.push(...newClues)
    }

    // 保存更新后的信息
    await atomicWriteJson(bookOutlinePath(bookId), await readJson(bookOutlinePath(bookId), defaultOutline()))
    await atomicWriteJson(bookLorePath(bookId), lore)
  } catch (error) {
    console.error('更新lore信息失败:', error)
    // 不中断主流程，仅记录错误
  }
}

export const readWorkspace = async (bookId: string) => {
  const meta = await readJson(bookMetaPath(bookId), null)
  const lore = await readJson<LoreData>(bookLorePath(bookId), defaultLore())
  const outline = await readJson<OutlineNode[]>(bookOutlinePath(bookId), defaultOutline())
  return { meta, lore, outline }
}

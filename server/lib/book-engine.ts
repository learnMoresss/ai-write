import { atomicWriteJson, bookLorePath, bookMetaPath, bookOutlinePath, chapterPath, readJson, type ChapterData, type LoreData, type OutlineNode } from './storage'

export const defaultLore = (): LoreData => ({
  world: '',
  factions: [],
  protagonist: '',
  sideCharacters: [],
  clues: []
})

export const defaultOutline = (): OutlineNode[] => []

export const ensureOutlineThree = async (bookId: string): Promise<OutlineNode[]> => {
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

export const generateChapterDraft = async (bookId: string, chapterId: string): Promise<ChapterData> => {
  const outline = await readJson<OutlineNode[]>(bookOutlinePath(bookId), defaultOutline())
  const node = outline.find(x => x.chapterId === chapterId)
  if (!node) {
    throw createError({ statusCode: 404, statusMessage: `Outline ${chapterId} not found` })
  }

  node.status = 'generating'
  await atomicWriteJson(bookOutlinePath(bookId), outline)

  const content = [
    `${node.chapterTitle}`,
    '',
    `${node.chapterContentOutline}`,
    '',
    '（MVP 占位正文）本段用于串联上下章，模拟流式生成后的落盘结果。'
  ].join('\n')

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
  return chapter
}

export const readWorkspace = async (bookId: string) => {
  const meta = await readJson(bookMetaPath(bookId), null)
  const lore = await readJson<LoreData>(bookLorePath(bookId), defaultLore())
  const outline = await readJson<OutlineNode[]>(bookOutlinePath(bookId), defaultOutline())
  return { meta, lore, outline }
}

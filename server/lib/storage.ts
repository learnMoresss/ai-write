import { promises as fs } from 'node:fs'
import { dirname, resolve } from 'node:path'

export const dataRoot = resolve(process.cwd(), 'server/data')
const booksRoot = resolve(dataRoot, 'books')

export type SettingsData = {
  provider: string
  model: string
  apiKeyMasked: string
  theme: 'light' | 'dark'
}

export type StylePreset = {
  id: string
  name: string
  systemPrompt: string
  vocabulary: string[]
  prohibitedWords: string[]
  isDefault: boolean
}

export type BookMeta = {
  id: string
  title: string
  oneLiner: string
  genre: string
  readers: string
  targetWords: number
  pace: string
  styleSnapshot: StylePreset | null
  finalGoal: string
  createdAt: string
  updatedAt: string
}

export type LoreData = {
  world: string
  factions: string[]
  protagonist: string
  sideCharacters: string[]
  clues: Array<{ id: string; title: string; status: 'pending' | 'resolved' }>
}

export type OutlineNode = {
  chapterId: 'ch_001' | 'ch_002' | 'ch_003'
  chapterTitle: string
  chapterContentOutline: string
  characters: string[]
  clues: string[]
  status: 'planned' | 'locked' | 'generating' | 'generated' | 'failed'
  summary?: string
}

export type ChapterData = {
  chapterId: string
  title: string
  content: string
  wordCount: number
  updatedAt: string
}

export const defaultSettings = (): SettingsData => ({
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKeyMasked: '',
  theme: 'light'
})

const ensureDir = async (path: string) => {
  await fs.mkdir(path, { recursive: true })
}

export const atomicWriteJson = async (path: string, data: unknown) => {
  await ensureDir(dirname(path))
  const temp = `${path}.tmp`
  await fs.writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  await fs.rename(temp, path)
}

export const readJson = async <T>(path: string, fallback: T): Promise<T> => {
  try {
    const raw = await fs.readFile(path, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    await atomicWriteJson(path, fallback)
    return fallback
  }
}

export const validateBookId = (value: string) => /^book_[a-zA-Z0-9_-]+$/.test(value)

export const createBookId = () => `book_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export const settingsPath = resolve(dataRoot, 'settings.json')
export const stylesPath = resolve(dataRoot, 'styles.json')

export const bookDir = (bookId: string) => resolve(booksRoot, bookId)
export const bookMetaPath = (bookId: string) => resolve(bookDir(bookId), 'meta.json')
export const bookLorePath = (bookId: string) => resolve(bookDir(bookId), 'lore.json')
export const bookOutlinePath = (bookId: string) => resolve(bookDir(bookId), 'outline.json')
export const chapterPath = (bookId: string, chapterId: string) => resolve(bookDir(bookId), 'chapters', `${chapterId}.json`)

export const readBookMeta = async (bookId: string) =>
  await readJson<BookMeta | null>(bookMetaPath(bookId), null)

export const listBooks = async () => {
  await ensureDir(booksRoot)
  const entries = await fs.readdir(booksRoot, { withFileTypes: true })
  const result: BookMeta[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (!validateBookId(entry.name)) continue
    const meta = await readBookMeta(entry.name)
    if (meta) result.push(meta)
  }
  return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

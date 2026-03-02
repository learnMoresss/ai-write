<script setup lang="ts">
import { apiGet, apiPut, apiPost } from '~/composables/useApi'

type OutlineNode = {
  chapterId: string
  chapterTitle: string
  chapterContentOutline: string
  characters: string[]
  clues: string[]
  status: 'planned' | 'locked' | 'generating' | 'generated' | 'failed'
  wordCount?: number
  summary?: string
}

type ChapterData = {
  chapterId: string
  title: string
  content: string
  wordCount: number
  updatedAt: string
}

const route = useRoute()
const id = computed(() => route.params.id as string)
const chapterId = computed(() => route.params.chapterId as string)

const chapter = ref<ChapterData | null>(null)
const outlineNode = ref<OutlineNode | null>(null)
const loading = ref(false)
const saving = ref(false)

const loadChapter = async () => {
  loading.value = true
  try {
    chapter.value = await apiGet<ChapterData>(`/api/books/${id.value}/chapters/${chapterId.value}`)
    const workspaceData = await apiGet<{ outline: OutlineNode[] }>(`/api/books/${id.value}/workspace`)
    const node = workspaceData.outline.find(n => n.chapterId === chapterId.value)
    outlineNode.value = node ?? null
  } finally {
    loading.value = false
  }
}

const saveChapter = async () => {
  if (!chapter.value) return

  saving.value = true
  try {
    const token = localStorage.getItem('fake_token') || 'dev-token'
    await apiPut(`/api/books/${id.value}/chapters/${chapterId.value}`, {
      title: chapter.value.title,
      content: chapter.value.content
    }, { 'x-fake-token': token })

    await reflexChapter()
    await navigateTo(`/books/${id.value}/workspace`)
  } finally {
    saving.value = false
  }
}

const reflexChapter = async () => {
  try {
    const token = localStorage.getItem('fake_token') || 'dev-token'
    await apiPost(`/api/books/${id.value}/reflex-chapter`, { chapterId: chapterId.value }, { 'x-fake-token': token })
  } catch {
    console.error('章节反刍失败')
  }
}

const goBack = () => {
  navigateTo(`/books/${id.value}/workspace`)
}

onMounted(loadChapter)
useSeoMeta({ title: '编辑章节' })
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-stone-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200/60 dark:border-slate-700/60">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div>
            <h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">编辑章节</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400" v-if="chapter">
              {{ chapter.title }} · {{ chapter.wordCount }} 字
            </p>
          </div>
          <div class="flex items-center gap-3">
            <UButton color="neutral" variant="outline" @click="goBack" class="flex items-center gap-2">
              <span class="i-lucide-arrow-left text-sm"></span>
              <span>返回工作台</span>
            </UButton>
            <UButton
              :disabled="saving"
              color="primary"
              variant="solid"
              @click="saveChapter"
              class="flex items-center gap-2"
            >
              <span v-if="saving" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                保存中...
              </span>
              <span v-else>
                <span class="i-lucide-save text-sm"></span>
                <span>保存章节</span>
              </span>
            </UButton>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div v-if="loading" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>

      <div v-else-if="!chapter" class="text-center py-10">
        <div class="text-slate-400 dark:text-slate-500 mb-4">📖 章节不存在</div>
        <p class="text-slate-500 dark:text-slate-400">找不到指定的章节，请检查链接是否正确</p>
        <UButton @click="goBack" class="mt-4">返回工作台</UButton>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 左侧大纲信息 -->
        <div class="lg:col-span-1">
          <div class="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 sticky top-24">
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">章节大纲</h2>

            <div v-if="outlineNode" class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">内容大纲</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg leading-relaxed">
                  {{ outlineNode.chapterContentOutline }}
                </p>
              </div>

              <div v-if="outlineNode.characters && outlineNode.characters.length > 0">
                <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">登场人物</h3>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="char in outlineNode.characters"
                    :key="char"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                  >
                    {{ char }}
                  </span>
                </div>
              </div>

              <div v-if="outlineNode.clues && outlineNode.clues.length > 0">
                <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">涉及伏笔</h3>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="clue in outlineNode.clues"
                    :key="clue"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  >
                    {{ clue }}
                  </span>
                </div>
              </div>

              <div>
                <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">状态</h3>
                <UBadge
                  :color="outlineNode.status === 'generated' ? 'success' :
                           outlineNode.status === 'locked' ? 'info' :
                           outlineNode.status === 'planned' ? 'primary' :
                           outlineNode.status === 'generating' ? 'secondary' : 'error'"
                  variant="solid"
                  class="capitalize"
                >
                  {{ outlineNode.status === 'generated' ? '已完成' :
                     outlineNode.status === 'locked' ? '已锁定' :
                     outlineNode.status === 'planned' ? '已规划' :
                     outlineNode.status === 'generating' ? '生成中' : '失败' }}
                </UBadge>
              </div>
            </div>

            <div v-else class="text-sm text-slate-500 dark:text-slate-400">
              此章节暂无大纲信息
            </div>
          </div>
        </div>

        <!-- 中间主要内容编辑区 -->
        <div class="lg:col-span-3">
          <div class="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <div class="p-5">
              <div class="mb-5">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">章节标题</label>
                <input
                  v-model="chapter.title"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="输入章节标题"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300">章节内容</label>
                  <span class="text-xs text-slate-500 dark:text-slate-400">{{ chapter.wordCount }} 字</span>
                </div>
                <UTextarea
                  v-model="chapter.content"
                  :rows="20"
                  class="w-full"
                  placeholder="在这里编辑章节内容..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
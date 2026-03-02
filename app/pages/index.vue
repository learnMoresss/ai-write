<script setup lang="ts">
import { apiGet, apiPost } from '~/composables/useApi'

type BookSummary = {
  id: string
  title: string
  genre: string
  targetWords: number
  updatedAt: string
  progress?: number // 添加进度信息
}

const books = ref<BookSummary[]>([])
const loading = ref(false)
const creating = ref(false)

const form = reactive({
  title: '',
  oneLiner: '',
  genre: '',
  readers: '',
  targetWords: 120000,
  pace: 'normal',
  styleId: ''
})

const errors = reactive<Record<string, string>>({})

const paceOptions = [
  { label: '快节奏', value: 'fast' },
  { label: '标准节奏', value: 'normal' },
  { label: '慢节奏', value: 'slow' }
]

const validateForm = () => {
  errors.title = form.title.trim() ? '' : '请填写书名'
  errors.genre = form.genre.trim() ? '' : '请填写题材'
  errors.oneLiner = form.oneLiner.trim() ? '' : '请填写一句话核心梗'
  errors.readers = form.readers.trim() ? '' : '请填写目标读者'
  errors.targetWords = Number(form.targetWords) > 0 ? '' : '预期字数必须大于 0'
  errors.pace = form.pace.trim() ? '' : '请选择节奏偏好'
  return !Object.values(errors).some(Boolean)
}

const fetchBooks = async () => {
  loading.value = true
  try {
    const bookSummaries = await apiGet<BookSummary[]>('/api/books')
    const booksWithProgress = await Promise.all(
      bookSummaries.map(async (book: BookSummary) => {
        try {
          const progressData = await apiGet<{ progress: number }>(`/api/books/${book.id}/progress`)
          return { ...book, progress: progressData.progress }
        } catch {
          console.warn(`Failed to get progress for book ${book.id}`)
          return book
        }
      })
    )
    books.value = booksWithProgress
  } finally {
    loading.value = false
  }
}

const createBook = async () => {
  if (!validateForm()) return
  creating.value = true
  try {
    const token = localStorage.getItem('fake_token') || 'dev-token'
    const created = await apiPost<{ id: string }>('/api/books', form, { 'x-fake-token': token })
    await fetchBooks()
    await navigateTo(`/books/${created.id}/workspace`)
  } finally {
    creating.value = false
  }
}

onMounted(fetchBooks)

useSeoMeta({ title: '作家工坊 | 开始创作' })
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-stone-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
    <!-- 顶部欢迎区域 -->
    <header class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">作家工坊</h1>
        <p class="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          在这里，每一个故事都有它的灵魂。开始一段新的创作旅程，让文字流淌出内心的风景。
        </p>
      </div>
    </header>

    <div class="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧书籍列表 -->
        <div class="lg:col-span-2">
          <section class="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
            <div class="p-5">
              <div class="flex items-center justify-between mb-5">
                <h2 class="text-2xl font-semibold text-slate-800 dark:text-slate-100">我的作品</h2>
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ books.length }} 部作品</span>
              </div>

              <div v-if="loading" class="flex justify-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>

              <div v-else-if="books.length === 0" class="text-center py-10">
                <div class="text-slate-400 dark:text-slate-500 mb-4">📚 还没有作品</div>
                <p class="text-slate-500 dark:text-slate-400">开始您的第一段创作之旅吧</p>
              </div>

              <div v-else class="space-y-4">
                <NuxtLink
                  v-for="book in books"
                  :key="book.id"
                  :to="`/books/${book.id}/workspace`"
                  class="block rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-750/50 transition-all duration-200 group"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400">
                          {{ book.title }}
                        </h3>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                          {{ book.genre }}
                        </span>
                      </div>

                      <div class="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-4">
                        <span>{{ new Date(book.updatedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) }}</span>
                        <span>{{ book.targetWords.toLocaleString() }} 字</span>
                        <div v-if="book.progress" class="flex items-center">
                          <span class="mr-2">进度:</span>
                          <div class="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              class="h-full bg-teal-500 rounded-full"
                              :style="{ width: `${Math.min(100, book.progress)}%` }"
                            ></div>
                          </div>
                          <span class="ml-2">{{ Math.round(book.progress) }}%</span>
                        </div>
                      </div>
                    </div>
                    <svg class="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </section>
        </div>

        <!-- 右侧创建表单 -->
        <div>
          <section class="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm sticky top-6">
            <div class="p-5">
              <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">开始新作品</h2>
              <p class="text-sm text-slate-600 dark:text-slate-300 mb-5">
                每一部伟大作品都始于一个简单的想法
              </p>

              <form class="space-y-5" @submit.prevent="createBook">
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">书名</label>
                    <input
                      v-model="form.title"
                      type="text"
                      class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      placeholder="如：星海归墟..."
                    />
                    <p v-if="errors.title" class="text-xs text-red-500">{{ errors.title }}</p>
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">一句话核心梗</label>
                    <textarea
                      v-model="form.oneLiner"
                      rows="2"
                      class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                      placeholder="如：主角在濒死回档中追查世界真相..."
                    ></textarea>
                    <p v-if="errors.oneLiner" class="text-xs text-red-500">{{ errors.oneLiner }}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-2">
                      <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">题材</label>
                      <input
                        v-model="form.genre"
                        type="text"
                        class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder="如：玄幻 / 科幻"
                      />
                      <p v-if="errors.genre" class="text-xs text-red-500">{{ errors.genre }}</p>
                    </div>

                    <div class="space-y-2">
                      <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">预期字数</label>
                      <input
                        v-model.number="form.targetWords"
                        type="number"
                        class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder="如：120000"
                      />
                      <p v-if="errors.targetWords" class="text-xs text-red-500">{{ errors.targetWords }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-2">
                      <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">目标读者</label>
                      <input
                        v-model="form.readers"
                        type="text"
                        class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder="如：男频成长向"
                      />
                      <p v-if="errors.readers" class="text-xs text-red-500">{{ errors.readers }}</p>
                    </div>

                    <div class="space-y-2">
                      <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">节奏偏好</label>
                      <select
                        v-model="form.pace"
                        class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      >
                        <option v-for="option in paceOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <p v-if="errors.pace" class="text-xs text-red-500">{{ errors.pace }}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  :disabled="creating"
                  class="w-full h-12 px-4 rounded-lg bg-linear-to-r from-teal-600 to-cyan-600 text-white font-medium disabled:opacity-60 hover:shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center"
                >
                  <span v-if="creating" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    创建中...
                  </span>
                  <span v-else>开始创作之旅 →</span>
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

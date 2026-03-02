<script setup lang="ts">
type BookSummary = {
  id: string
  title: string
  genre: string
  targetWords: number
  updatedAt: string
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
    const result = await $fetch<{ data: BookSummary[] }>('/api/books')
    books.value = result.data
  } finally {
    loading.value = false
  }
}

const createBook = async () => {
  if (!validateForm()) return
  creating.value = true
  try {
    const token = localStorage.getItem('fake_token') || 'dev-token'
    const created = await $fetch<{ data: { id: string } }>('/api/books', {
      method: 'POST',
      headers: { 'x-fake-token': token },
      body: form
    })
    await fetchBooks()
    await navigateTo(`/books/${created.data.id}/workspace`)
  } finally {
    creating.value = false
  }
}

onMounted(fetchBooks)

useSeoMeta({ title: '首页 | Books' })
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <section class="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950">
      <h1 class="text-2xl font-semibold">书籍管理</h1>
      <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">创建向导只做地基，不提前透支章节大纲。</p>
    </section>

    <section class="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950 space-y-3">
      <h2 class="text-lg font-medium">创建向导</h2>
      <form class="space-y-4" @submit.prevent="createBook">
        <div class="grid md:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-sm text-slate-700 dark:text-slate-300">书名</label>
            <UInput v-model="form.title" placeholder="例如：星海归墟" />
            <p v-if="errors.title" class="text-xs text-red-500">{{ errors.title }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-slate-700 dark:text-slate-300">题材</label>
            <UInput v-model="form.genre" placeholder="例如：玄幻 / 科幻" />
            <p v-if="errors.genre" class="text-xs text-red-500">{{ errors.genre }}</p>
          </div>

          <div class="space-y-1 md:col-span-2">
            <label class="text-sm text-slate-700 dark:text-slate-300">一句话核心梗</label>
            <UInput v-model="form.oneLiner" placeholder="主角在濒死回档中追查世界真相" />
            <p v-if="errors.oneLiner" class="text-xs text-red-500">{{ errors.oneLiner }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-slate-700 dark:text-slate-300">目标读者</label>
            <UInput v-model="form.readers" placeholder="例如：男频成长向" />
            <p v-if="errors.readers" class="text-xs text-red-500">{{ errors.readers }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-slate-700 dark:text-slate-300">预期字数</label>
            <UInput v-model.number="form.targetWords" type="number" placeholder="120000" />
            <p v-if="errors.targetWords" class="text-xs text-red-500">{{ errors.targetWords }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-slate-700 dark:text-slate-300">节奏偏好</label>
            <select
              v-model="form.pace"
              class="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
            >
              <option v-for="option in paceOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p v-if="errors.pace" class="text-xs text-red-500">{{ errors.pace }}</p>
          </div>
        </div>

        <button
          type="submit"
          :disabled="creating"
          class="h-10 px-4 rounded-md bg-teal-600 text-white text-sm disabled:opacity-60"
        >
          {{ creating ? '创建中...' : '创建并进入工作台' }}
        </button>
      </form>
    </section>

    <section class="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950">
      <h2 class="text-lg font-medium mb-3">书籍列表</h2>
      <div v-if="loading" class="text-sm text-slate-500">加载中...</div>
      <div v-else-if="books.length === 0" class="text-sm text-slate-500">暂无书籍</div>
      <div v-else class="space-y-2">
        <NuxtLink
          v-for="book in books"
          :key="book.id"
          :to="`/books/${book.id}/workspace`"
          class="block rounded-md border border-slate-200 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <div class="flex items-center justify-between">
            <p class="font-medium">{{ book.title }}</p>
            <p class="text-xs text-slate-500">{{ new Date(book.updatedAt).toLocaleDateString('zh-CN') }}</p>
          </div>
          <p class="text-xs text-slate-500 mt-1">{{ book.genre }} · 目标 {{ book.targetWords.toLocaleString() }} 字</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

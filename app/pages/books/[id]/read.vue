<script setup lang="ts">
type ReadChapter = {
  chapterId: string
  title: string
  content: string
  wordCount: number
}

const route = useRoute()
const id = computed(() => route.params.id as string)
const side = ref<'left' | 'right'>('left')
const chapters = ref<ReadChapter[]>([])
const currentIndex = ref(0)

const loadReadData = async () => {
  const result = await $fetch<{ data: { chapters: ReadChapter[] } }>(`/api/books/${id.value}/read`)
  chapters.value = result.data.chapters
  currentIndex.value = 0
}

const current = computed(() => chapters.value[currentIndex.value] || null)
const prev = () => { if (currentIndex.value > 0) currentIndex.value -= 1 }
const next = () => { if (currentIndex.value < chapters.value.length - 1) currentIndex.value += 1 }

onMounted(() => {
  loadReadData()
  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') prev()
    if (event.key === 'ArrowRight') next()
  })
})

useSeoMeta({ title: '沉浸阅读' })
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <header class="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 py-3 mb-4 flex items-center justify-between">
      <div>
        <p class="font-semibold">沉浸阅读模式</p>
        <p v-if="current" class="text-sm text-slate-500">{{ current.chapterId }} · {{ current.title }}</p>
      </div>
      <UButton color="neutral" variant="ghost" @click="side = side === 'left' ? 'right' : 'left'">
        目录切换到{{ side === 'left' ? '右侧' : '左侧' }}
      </UButton>
    </header>

    <div class="flex gap-4" :class="side === 'right' ? 'flex-row-reverse' : ''">
      <aside class="w-56 shrink-0 rounded-md border border-slate-200 dark:border-slate-800 p-2 h-fit">
        <button
          v-for="(item, index) in chapters"
          :key="item.chapterId"
          class="w-full text-left px-2 py-2 rounded text-sm"
          :class="index === currentIndex ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' : 'hover:bg-slate-100 dark:hover:bg-slate-900'"
          @click="currentIndex = index"
        >
          {{ item.chapterId }} {{ item.title }}
        </button>
      </aside>

      <article class="flex-1 rounded-md border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-950">
        <div v-if="current" class="max-w-3xl mx-auto">
          <h1 class="text-2xl font-semibold">{{ current.title }}</h1>
          <p class="text-xs text-slate-500 mt-2">本章字数：{{ current.wordCount }} 字</p>
          <pre class="whitespace-pre-wrap font-sans leading-loose mt-6 text-[16px]">{{ current.content }}</pre>
          <div class="mt-8 flex items-center justify-between">
            <UButton color="neutral" variant="soft" :disabled="currentIndex === 0" @click="prev">上一章</UButton>
            <UButton color="neutral" variant="soft" :disabled="currentIndex >= chapters.length - 1" @click="next">下一章</UButton>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

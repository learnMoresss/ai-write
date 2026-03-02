<script setup lang="ts">
import { apiGet } from '~/composables/useApi'

type ReadChapter = {
  chapterId: string
  title: string
  content: string
  wordCount: number
  mood?: string // 情绪基调
  pov?: string // 视角人物
}

const route = useRoute()
const id = computed(() => route.params.id as string)
const side = ref<'left' | 'right'>('left')
const chapters = ref<ReadChapter[]>([])
const currentIndex = ref(0)
const showWordCount = ref(true)

const loadReadData = async () => {
  const data = await apiGet<{ chapters: ReadChapter[] }>(`/api/books/${id.value}/read`)
  chapters.value = data.chapters
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
  <div class="min-h-screen bg-linear-to-br from-amber-50 to-stone-100 dark:from-slate-900 dark:to-slate-800">
    <!-- 阅读头部 -->
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200/60 dark:border-slate-700/60 py-3">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div>
          <p class="font-semibold text-slate-800 dark:text-slate-100">沉浸阅读模式</p>
          <p v-if="current" class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">
              {{ current.chapterId.replace('ch_', '') }}
            </span>
            {{ current.title }}
            <span v-if="current.mood" class="ml-2 px-2 py-0.5 rounded-full text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
              {{ current.mood }}
            </span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            @click="showWordCount = !showWordCount"
            class="flex items-center gap-1"
          >
            <span class="i-lucide-type text-sm"></span>
            <span v-if="showWordCount">隐藏字数</span>
            <span v-else>显示字数</span>
          </UButton>

          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            @click="side = side === 'left' ? 'right' : 'left'"
            class="flex items-center gap-1"
          >
            <span class="i-lucide-panel-left text-sm"></span>
            <span>目录{{ side === 'left' ? '右' : '左' }}置</span>
          </UButton>

          <UButton
            color="primary"
            variant="solid"
            size="sm"
            :to="`/books/${id}/workspace`"
            class="flex items-center gap-1"
          >
            <span class="i-lucide-edit text-sm"></span>
            <span>编辑</span>
          </UButton>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex gap-6" :class="side === 'right' ? 'flex-row-reverse' : ''">
        <!-- 侧边目录 -->
        <aside class="w-64 shrink-0 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 h-fit bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-24">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-medium text-slate-800 dark:text-slate-100">章节列表</h3>
            <span class="text-xs text-slate-500 dark:text-slate-400">{{ chapters.length }} 章</span>
          </div>

          <div class="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            <button
              v-for="(item, index) in chapters"
              :key="item.chapterId"
              class="w-full text-left px-3 py-3 rounded-lg text-sm transition-all flex items-start gap-2"
              :class="index === currentIndex ?
                'bg-linear-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/50' :
                'hover:bg-slate-100 dark:hover:bg-slate-700/50'"
              @click="currentIndex = index"
            >
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mt-0.5"
                :class="index === currentIndex ?
                  'bg-teal-500 text-white' :
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'">
                {{ item.chapterId.replace('ch_', '') }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="truncate">{{ item.title }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                  <span>{{ item.wordCount }} 字</span>
                  <span v-if="item.mood" class="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                    {{ item.mood }}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </aside>

        <!-- 主内容区 -->
        <article class="flex-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <div v-if="current" class="max-w-3xl mx-auto">
            <!-- 章节信息 -->
            <div class="mb-8 pb-6 border-b border-slate-200 dark:border-slate-700/50">
              <div class="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-2">
                  <span class="i-lucide-hash text-sm"></span>
                  <span>{{ current.chapterId }}</span>
                </div>

                <div v-if="current.pov" class="flex items-center gap-2">
                  <span class="i-lucide-eye text-sm"></span>
                  <span>视点：{{ current.pov }}</span>
                </div>

                <div v-if="showWordCount" class="flex items-center gap-2 ml-auto">
                  <span class="i-lucide-type text-sm"></span>
                  <span class="font-mono">{{ current.wordCount.toLocaleString() }} 字</span>
                </div>
              </div>

              <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">
                {{ current.title }}
              </h1>
            </div>

            <!-- 正文内容 -->
            <div class="prose prose-slate dark:prose-invert max-w-none text-lg leading-relaxed">
              <pre class="whitespace-pre-wrap font-sans leading-loose text-[17px] text-slate-700 dark:text-slate-300 bg-transparent p-0">{{ current.content }}</pre>
            </div>

            <!-- 章节底部导航 -->
            <div class="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
              <UButton
                color="neutral"
                variant="outline"
                :disabled="currentIndex === 0"
                @click="prev"
                class="flex items-center gap-2"
              >
                <span class="i-lucide-chevron-left text-sm"></span>
                <span>上一章</span>
              </UButton>

              <div class="text-sm text-slate-500 dark:text-slate-400">
                第 {{ currentIndex + 1 }} 章，共 {{ chapters.length }} 章
              </div>

              <UButton
                color="neutral"
                variant="outline"
                :disabled="currentIndex >= chapters.length - 1"
                @click="next"
                class="flex items-center gap-2"
              >
                <span>下一章</span>
                <span class="i-lucide-chevron-right text-sm"></span>
              </UButton>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

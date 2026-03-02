<script setup lang="ts">
import { apiGet, apiPost } from '~/composables/useApi'

type OutlineNode = {
  chapterId: string
  chapterTitle: string
  chapterContentOutline: string
  characters: string[]
  clues: string[]
  status: 'planned' | 'locked' | 'generating' | 'generated' | 'failed'
  wordCount?: number
}

const route = useRoute()
const id = computed(() => route.params.id as string)
const outline = ref<OutlineNode[]>([])
const loading = ref(false)
const showCluesPanel = ref(false)

const loadWorkspace = async () => {
  loading.value = true
  try {
    const data = await apiGet<{ outline: OutlineNode[] }>(`/api/books/${id.value}/workspace`)
    outline.value = data.outline
  } finally {
    loading.value = false
  }
}

const planThree = async () => {
  const token = localStorage.getItem('fake_token') || 'dev-token'
  await apiPost(`/api/books/${id.value}/outline/plan-next-three`, undefined, { 'x-fake-token': token })
  await loadWorkspace()
}

const generateOne = async (chapterId: string) => {
  const token = localStorage.getItem('fake_token') || 'dev-token'
  await apiPost(`/api/books/${id.value}/chapters/${chapterId}/generate`, undefined, { 'x-fake-token': token })
  await loadWorkspace()
}

const batchGenerate = async () => {
  const token = localStorage.getItem('fake_token') || 'dev-token'
  await apiPost(`/api/books/${id.value}/chapters/batch-generate-three`, undefined, { 'x-fake-token': token })
  await loadWorkspace()
}

const getStatusColor = (status: string): 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' => {
  switch (status) {
    case 'planned': return 'info'
    case 'locked': return 'success'
    case 'generating': return 'warning'
    case 'generated': return 'success'
    case 'failed': return 'error'
    default: return 'neutral'
  }
}

const getNodeStatusText = (status: string) => {
  switch (status) {
    case 'planned': return '已规划'
    case 'locked': return '已锁定'
    case 'generating': return '生成中'
    case 'generated': return '已完成'
    case 'failed': return '失败'
    default: return status
  }
}

onMounted(loadWorkspace)
useSeoMeta({ title: '作家工坊 | 创作空间' })
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-stone-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200/60 dark:border-slate-700/60">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div>
            <h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">创作空间</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">继续您的创作之旅</p>
          </div>
          <div class="flex items-center gap-3">
            <UButton
              color="primary"
              variant="solid"
              @click="showCluesPanel = !showCluesPanel"
              class="flex items-center gap-2"
            >
              <span class="i-lucide-lightbulb text-sm"></span>
              <span v-if="!showCluesPanel">伏笔面板</span>
              <span v-else>隐藏</span>
            </UButton>
            <UButton color="neutral" variant="ghost" :to="`/books/${id}/read`" class="flex items-center gap-2">
              <span class="i-lucide-book-open text-sm"></span>
              <span>阅读模式</span>
            </UButton>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- 创作控制面板 -->
      <section class="mb-6">
        <div class="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div class="p-5">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">故事创作控制台</h2>
                <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  您的创作世界正在构建中，每一步都塑造着故事的命运
                </p>
              </div>
              <div class="flex flex-wrap gap-3">
                <UButton
                  color="primary"
                  @click="planThree"
                  class="flex items-center gap-2"
                >
                  <span class="i-lucide-map text-sm"></span>
                  <span>规划后续3章</span>
                </UButton>
                <UButton
                  color="secondary"
                  variant="outline"
                  @click="batchGenerate"
                  class="flex items-center gap-2"
                >
                  <span class="i-lucide-feather text-sm"></span>
                  <span>生成三章正文</span>
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 伏笔追踪面板 -->
      <transition name="slide-down">
        <section v-if="showCluesPanel" class="mb-6">
          <div class="rounded-2xl border border-amber-200/60 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-900/10 backdrop-blur-sm">
            <div class="p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <span class="i-lucide-lightbulb"></span>
                  伏笔追踪器
                </h3>
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  @click="showCluesPanel = false"
                >
                  <span class="i-lucide-x text-sm"></span>
                </UButton>
              </div>
              <p class="text-sm text-amber-700 dark:text-amber-300 mb-4">
                这些伏笔正在等待被回收或发展，请注意它们在故事中的位置和时机
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                  v-for="clue in ['神秘的青铜铃铛', '山中老人的真实身份', '主角身世的秘密']"
                  :key="clue"
                  class="p-3 rounded-lg bg-white dark:bg-slate-700/50 border border-amber-200/50 dark:border-amber-700/30"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-amber-800 dark:text-amber-200">{{ clue }}</span>
                    <span class="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300">
                      待回收
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </transition>

      <!-- 三章大纲展示 -->
      <section>
        <div class="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div class="p-5">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">故事节点规划</h2>
              <span class="text-sm text-slate-500 dark:text-slate-400">
                {{ outline.filter(n => n.status !== 'generated').length }} 个待完成节点
              </span>
            </div>

            <div v-if="loading" class="flex justify-center py-10">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>

            <div v-else-if="outline.length === 0" class="text-center py-10">
              <div class="text-slate-400 dark:text-slate-500 mb-4">📝 尚未规划大纲</div>
              <p class="text-slate-500 dark:text-slate-400">点击上方按钮开始规划您的故事节点</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="node in outline"
                :key="node.chapterId"
                class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-3">
                      <h3 class="text-lg font-medium text-slate-800 dark:text-slate-100">
                        {{ node.chapterId }} · {{ node.chapterTitle }}
                      </h3>
                      <UBadge
                        :color="getStatusColor(node.status)"
                        variant="solid"
                        class="capitalize"
                      >
                        {{ getNodeStatusText(node.status) }}
                      </UBadge>
                      <span v-if="node.wordCount" class="text-xs text-slate-500 dark:text-slate-400">
                        {{ node.wordCount }} 字
                      </span>
                    </div>

                    <p class="text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                      {{ node.chapterContentOutline }}
                    </p>

                    <div class="flex flex-wrap gap-3">
                      <div v-if="node.characters && node.characters.length > 0">
                        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">出场人物</span>
                        <div class="flex flex-wrap gap-1">
                          <span
                            v-for="char in node.characters"
                            :key="char"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                          >
                            {{ char }}
                          </span>
                        </div>
                      </div>

                      <div v-if="node.clues && node.clues.length > 0">
                        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">伏笔线索</span>
                        <div class="flex flex-wrap gap-1">
                          <span
                            v-for="clue in node.clues"
                            :key="clue"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          >
                            {{ clue }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <UButton
                      size="sm"
                      :disabled="node.status !== 'locked'"
                      @click="generateOne(node.chapterId)"
                      :variant="node.status === 'locked' ? 'solid' : 'soft'"
                      :color="node.status === 'locked' ? 'primary' : 'neutral'"
                      class="min-w-[100px]"
                    >
                      <span v-if="node.status === 'generating'">生成中...</span>
                      <span v-else-if="node.status === 'generated'">已生成</span>
                      <span v-else-if="node.status === 'locked'">生成正文</span>
                      <span v-else>锁定后生成</span>
                    </UButton>

                    <UButton
                      size="sm"
                      variant="outline"
                      color="neutral"
                      :to="`/books/${id}/workspace/${node.chapterId}/edit`"
                      class="min-w-[100px]"
                    >
                      详细编辑
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active {
  transition: all 0.3s ease-out;
}

.slide-down-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>

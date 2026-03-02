<script setup lang="ts">
import { apiGet, apiPost, apiPut, apiDelete } from '~/composables/useApi'

type StylePreset = {
  id: string
  name: string
  systemPrompt: string
  vocabulary: string[]
  prohibitedWords: string[]
  isDefault?: boolean
}

const styles = ref<StylePreset[]>([])
const form = reactive({
  id: '',
  name: '',
  systemPrompt: '',
  vocabulary: [] as string[],
  prohibitedWords: [] as string[],
  isDefault: false
})

const showForm = ref(false)
const editingStyle = ref<StylePreset | null>(null)
const loading = ref(false)

const fetchStyles = async () => {
  loading.value = true
  try {
    styles.value = await apiGet<StylePreset[]>('/api/styles')
  } finally {
    loading.value = false
  }
}

const saveStyle = async () => {
  const token = localStorage.getItem('fake_token') || 'dev-token'
  loading.value = true

  try {
    const body = {
      name: form.name,
      systemPrompt: form.systemPrompt,
      vocabulary: form.vocabulary,
      prohibitedWords: form.prohibitedWords,
      isDefault: form.isDefault
    }
    if (editingStyle.value) {
      await apiPut(`/api/styles/${editingStyle.value.id}`, body, { 'x-fake-token': token })
    } else {
      await apiPost('/api/styles', body, { 'x-fake-token': token })
    }

    Object.assign(form, {
      id: '',
      name: '',
      systemPrompt: '',
      vocabulary: [],
      prohibitedWords: [],
      isDefault: false
    })
    editingStyle.value = null
    showForm.value = false
    await fetchStyles()
  } finally {
    loading.value = false
  }
}

const removeStyle = async (styleId: string) => {
  if (!confirm('确定要删除这个文风预设吗？此操作不可撤销。')) {
    return
  }

  const token = localStorage.getItem('fake_token') || 'dev-token'
  loading.value = true
  try {
    await apiDelete(`/api/styles/${styleId}`, { 'x-fake-token': token })
    await fetchStyles()
  } finally {
    loading.value = false
  }
}

const editStyle = (style: StylePreset) => {
  Object.assign(form, style)
  // 确保数组字段正确初始化
  form.vocabulary = [...style.vocabulary]
  form.prohibitedWords = [...style.prohibitedWords]
  editingStyle.value = style
  showForm.value = true
}

const openFormForNew = () => {
  showForm.value = true
  editingStyle.value = null
  Object.assign(form, {
    id: '',
    name: '',
    systemPrompt: '',
    vocabulary: [],
    prohibitedWords: [],
    isDefault: false
  })
}

const cancelEdit = () => {
  showForm.value = false
  editingStyle.value = null
  Object.assign(form, {
    id: '',
    name: '',
    systemPrompt: '',
    vocabulary: [],
    prohibitedWords: [],
    isDefault: false
  })
}

// 监听表单变化，更新数组字段
const vocabularyStr = computed({
  get: () => form.vocabulary.join('\n'),
  set: (value) => {
    form.vocabulary = value.split('\n').map(v => v.trim()).filter(Boolean)
  }
})

const prohibitedWordsStr = computed({
  get: () => form.prohibitedWords.join('\n'),
  set: (value) => {
    form.prohibitedWords = value.split('\n').map(v => v.trim()).filter(Boolean)
  }
})

onMounted(fetchStyles)

useSeoMeta({ title: '作家工坊 | 文风管理' })
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-amber-50 to-stone-100 dark:from-slate-900 dark:to-slate-800">
    <div class="max-w-6xl mx-auto">
      <header class="mb-8 px-4 sm:px-6 lg:px-8 pt-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">文风管理</h1>
            <p class="text-slate-600 dark:text-slate-400 mt-2">
              为您的创作定制独特的风格，让文字更具个性
            </p>
          </div>
          <UButton
            color="primary"
            variant="solid"
            @click="openFormForNew()"
            class="flex items-center gap-2"
          >
            <span class="i-lucide-plus text-sm"></span>
            <span>新增文风</span>
          </UButton>
        </div>
      </header>

      <!-- 加载状态 -->
      <div v-if="loading && styles.length === 0" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>

      <!-- 创建/编辑表单 -->
      <transition name="fade">
        <section v-if="showForm" class="mb-8">
          <div class="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {{ editingStyle ? '编辑文风' : '创建新文风' }}
              </h2>
              <UButton
                color="neutral"
                variant="ghost"
                @click="cancelEdit"
                class="flex items-center gap-1"
              >
                <span class="i-lucide-x text-sm"></span>
              </UButton>
            </div>

            <form class="space-y-5" @submit.prevent="saveStyle">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">文风名称</label>
                  <UInput
                    v-model="form.name"
                    type="text"
                    class="w-full"
                    placeholder="如：古典雅致、现代简约、诗意浪漫..."
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">是否设为默认</label>
                  <div class="flex items-center pt-2">
                    <UToggle v-model="form.isDefault" />
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">系统提示词</label>
                <UTextarea
                  v-model="form.systemPrompt"
                  :rows="5"
                  class="w-full"
                  placeholder="在此处定义AI的写作风格和语言习惯，例如：使用优美的古风词汇，避免过于现代化的表达，注重意境的营造..."
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">偏好词汇</label>
                  <UTextarea
                    v-model="vocabularyStr"
                    :rows="3"
                    class="w-full"
                    placeholder="请输入偏好使用的词汇，每行一个词汇"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">禁止词汇</label>
                  <UTextarea
                    v-model="prohibitedWordsStr"
                    :rows="3"
                    class="w-full"
                    placeholder="请输入禁止使用的词汇，每行一个词汇"
                  />
                </div>
              </div>

              <div class="flex items-center gap-3 pt-4">
                <UButton
                  :loading="loading"
                  color="primary"
                  variant="solid"
                  type="submit"
                  class="flex items-center gap-2"
                >
                  <span class="i-lucide-save text-sm"></span>
                  <span>{{ editingStyle ? '更新文风' : '保存文风' }}</span>
                </UButton>
                <UButton
                  color="neutral"
                  variant="outline"
                  @click="cancelEdit"
                  :disabled="loading"
                >
                  取消
                </UButton>
              </div>
            </form>
          </div>
        </section>
      </transition>

      <!-- 预设列表 -->
      <section>
        <div class="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100">已保存的文风</h2>
            <span class="text-sm text-slate-500 dark:text-slate-400">{{ styles.length }} 个文风</span>
          </div>

          <div v-if="loading && styles.length > 0" class="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center rounded-2xl" style="margin-top: -24px; margin-right: -24px; margin-bottom: -24px; margin-left: -24px;">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>

          <div v-if="styles.length === 0 && !loading" class="text-center py-12">
            <div class="text-slate-400 dark:text-slate-500 mb-4">🎨 还没有文风预设</div>
            <p class="text-slate-500 dark:text-slate-400">创建您的第一个文风预设，为创作注入独特个性</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="item in styles"
              :key="item.id"
              class="rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-5 bg-white dark:bg-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 relative"
            >
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  {{ item.name }}
                  <span v-if="item.isDefault" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    默认
                  </span>
                </h3>
                <div class="flex items-center gap-2">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    @click="editStyle(item)"
                    class="flex items-center gap-1"
                  >
                    <span class="i-lucide-edit text-xs"></span>
                  </UButton>
                  <UButton
                    size="xs"
                    color="error"
                    variant="ghost"
                    @click="removeStyle(item.id)"
                    class="flex items-center gap-1"
                  >
                    <span class="i-lucide-trash text-xs"></span>
                  </UButton>
                </div>
              </div>

              <div class="space-y-3">
                <div v-if="item.systemPrompt" class="text-sm text-slate-600 dark:text-slate-300">
                  <p class="line-clamp-3">{{ item.systemPrompt }}</p>
                </div>

                <div v-if="item.vocabulary && item.vocabulary.length > 0" class="pt-2">
                  <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">偏好词汇</p>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="vocab in item.vocabulary.slice(0, 5)"
                      :key="vocab"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                    >
                      {{ vocab }}
                    </span>
                    <span
                      v-if="item.vocabulary.length > 5"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"
                    >
                      +{{ item.vocabulary.length - 5 }}
                    </span>
                  </div>
                </div>

                <div v-if="item.prohibitedWords && item.prohibitedWords.length > 0" class="pt-2">
                  <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">禁止词汇</p>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="word in item.prohibitedWords.slice(0, 5)"
                      :key="word"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                    >
                      {{ word }}
                    </span>
                    <span
                      v-if="item.prohibitedWords.length > 5"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"
                    >
                      +{{ item.prohibitedWords.length - 5 }}
                    </span>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

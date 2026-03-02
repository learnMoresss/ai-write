<script setup lang="ts">
type OutlineNode = {
  chapterId: string
  chapterTitle: string
  chapterContentOutline: string
  characters: string[]
  clues: string[]
  status: 'planned' | 'locked' | 'generating' | 'generated' | 'failed'
}

const route = useRoute()
const id = computed(() => route.params.id as string)
const outline = ref<OutlineNode[]>([])
const loading = ref(false)

const loadWorkspace = async () => {
  loading.value = true
  try {
    const result = await $fetch<{ data: { outline: OutlineNode[] } }>(`/api/books/${id.value}/workspace`)
    outline.value = result.data.outline
  } finally {
    loading.value = false
  }
}

const planThree = async () => {
  const token = localStorage.getItem('fake_token') || 'dev-token'
  await $fetch(`/api/books/${id.value}/outline/plan-next-three`, {
    method: 'POST',
    headers: { 'x-fake-token': token }
  })
  await loadWorkspace()
}

const generateOne = async (chapterId: string) => {
  const token = localStorage.getItem('fake_token') || 'dev-token'
  await $fetch(`/api/books/${id.value}/chapters/${chapterId}/generate`, {
    method: 'POST',
    headers: { 'x-fake-token': token }
  })
  await loadWorkspace()
}

const batchGenerate = async () => {
  const token = localStorage.getItem('fake_token') || 'dev-token'
  await $fetch(`/api/books/${id.value}/chapters/batch-generate-three`, {
    method: 'POST',
    headers: { 'x-fake-token': token }
  })
  await loadWorkspace()
}

onMounted(loadWorkspace)
useSeoMeta({ title: '单书工作台' })
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-4">
    <section class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950">
      <h1 class="text-xl font-semibold">工作台</h1>
      <p class="text-sm text-slate-500 mt-1">滚动规划固定三章：`ch_001`、`ch_002`、`ch_003`。</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <UButton color="primary" @click="planThree">规划后续3章</UButton>
        <UButton color="neutral" variant="soft" @click="batchGenerate">生成三章正文（串行）</UButton>
        <UButton color="neutral" variant="ghost" :to="`/books/${id}/read`">进入阅读模式</UButton>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950">
      <h2 class="text-lg font-medium mb-3">三章大纲</h2>
      <div v-if="loading" class="text-sm text-slate-500">加载中...</div>
      <div v-else-if="outline.length === 0" class="text-sm text-slate-500">尚未规划大纲</div>
      <div v-else class="space-y-3">
        <div v-for="node in outline" :key="node.chapterId" class="rounded-md border border-slate-200 dark:border-slate-800 p-3">
          <div class="flex items-center justify-between gap-3">
            <p class="font-medium">{{ node.chapterId }} · {{ node.chapterTitle }}</p>
            <div class="flex items-center gap-2">
              <UBadge color="neutral" variant="subtle">{{ node.status }}</UBadge>
              <UButton size="xs" @click="generateOne(node.chapterId)">生成正文</UButton>
            </div>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-300 mt-2">{{ node.chapterContentOutline }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

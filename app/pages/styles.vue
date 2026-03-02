<script setup lang="ts">
type StylePreset = {
  id: string
  name: string
  systemPrompt: string
  vocabulary: string[]
  prohibitedWords: string[]
  isDefault?: boolean
}

const styles = ref<StylePreset[]>([])
const form = reactive<StylePreset>({
  id: '',
  name: '',
  systemPrompt: '',
  vocabulary: [],
  prohibitedWords: [],
  isDefault: false
})

const fetchStyles = async () => {
  const result = await $fetch<{ data: StylePreset[] }>('/api/styles')
  styles.value = result.data
}

const saveStyle = async () => {
  const token = localStorage.getItem('fake_token') || 'dev-token'
  await $fetch('/api/styles', {
    method: 'POST',
    headers: { 'x-fake-token': token },
    body: {
      name: form.name,
      systemPrompt: form.systemPrompt,
      vocabulary: form.vocabulary,
      prohibitedWords: form.prohibitedWords,
      isDefault: form.isDefault
    }
  })
  form.name = ''
  form.systemPrompt = ''
  form.vocabulary = []
  form.prohibitedWords = []
  form.isDefault = false
  await fetchStyles()
}

const removeStyle = async (id: string) => {
  const token = localStorage.getItem('fake_token') || 'dev-token'
  await $fetch(`/api/styles/${id}`, {
    method: 'DELETE',
    headers: { 'x-fake-token': token }
  })
  await fetchStyles()
}

onMounted(fetchStyles)

useSeoMeta({ title: '文风管理' })
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-5">
    <section class="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950 space-y-3">
      <h1 class="text-xl font-semibold">文风管理</h1>
      <UInput v-model="form.name" placeholder="名称" />
      <UTextarea v-model="form.systemPrompt" :rows="4" placeholder="systemPrompt" />
      <UInput
        :model-value="form.vocabulary.join(',')"
        placeholder="偏好词汇，逗号分隔"
        @update:model-value="(value) => form.vocabulary = (value as string).split(',').map(v => v.trim()).filter(Boolean)"
      />
      <UInput
        :model-value="form.prohibitedWords.join(',')"
        placeholder="禁止词汇，逗号分隔"
        @update:model-value="(value) => form.prohibitedWords = (value as string).split(',').map(v => v.trim()).filter(Boolean)"
      />
      <UCheckbox v-model="form.isDefault" label="设为默认" />
      <UButton color="primary" @click="saveStyle">保存文风</UButton>
    </section>

    <section class="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950">
      <h2 class="text-lg font-medium mb-3">预设列表</h2>
      <div class="space-y-2">
        <div
          v-for="item in styles"
          :key="item.id"
          class="rounded-md border border-slate-200 dark:border-slate-800 p-3 flex items-start justify-between gap-3"
        >
          <div>
            <p class="font-medium">{{ item.name }} <span v-if="item.isDefault" class="text-xs text-amber-600">默认</span></p>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ item.systemPrompt }}</p>
          </div>
          <UButton color="error" variant="soft" size="sm" @click="removeStyle(item.id)">删除</UButton>
        </div>
      </div>
    </section>
  </div>
</template>

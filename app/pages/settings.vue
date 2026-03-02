<script setup lang="ts">
type Settings = {
  provider: string
  model: string
  apiKeyMasked: string
  theme: 'light' | 'dark'
}

const settings = reactive<Settings>({
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKeyMasked: '',
  theme: 'light'
})

const save = async () => {
  const token = localStorage.getItem('fake_token') || 'dev-token'
  await $fetch('/api/settings', {
    method: 'PUT',
    headers: { 'x-fake-token': token },
    body: settings
  })
}

onMounted(async () => {
  const result = await $fetch<{ data: Settings }>('/api/settings')
  Object.assign(settings, result.data)
})

useSeoMeta({ title: '设置' })
</script>

<template>
  <div class="max-w-3xl mx-auto rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950 space-y-4">
    <h1 class="text-xl font-semibold">设置</h1>
    <div class="grid md:grid-cols-2 gap-3">
      <UInput v-model="settings.provider" placeholder="AI Provider" />
      <UInput v-model="settings.model" placeholder="Model" />
      <UInput v-model="settings.apiKeyMasked" placeholder="API Key（掩码显示）" />
      <UInput v-model="settings.theme" placeholder="theme: light/dark" />
    </div>
    <UButton color="primary" @click="save">保存设置</UButton>
  </div>
</template>

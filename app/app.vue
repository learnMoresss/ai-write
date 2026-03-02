<script setup lang="ts">
const sidebarCollapsed = ref(false)

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: { lang: 'zh-CN' }
})

useSeoMeta({
  title: 'AI 写作平台',
  description: '主线锚点 + 滚动大纲 + 章节反刍的长篇创作平台'
})
</script>

<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950">
    <AppSidebar v-model:collapsed="sidebarCollapsed" />
    <main class="flex-1 min-w-0 p-4 md:p-6 overflow-auto">
      <NuxtPage />
    </main>
  </div>
</template>

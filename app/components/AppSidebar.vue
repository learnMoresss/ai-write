<script setup lang="ts">
const collapsed = defineModel<boolean>('collapsed', { default: false })

const items = [
  { label: '首页', to: '/', icon: 'i-lucide-book-open' },
  { label: '文风', to: '/styles', icon: 'i-lucide-pen-line' },
  { label: '设置', to: '/settings', icon: 'i-lucide-settings-2' }
]
</script>

<template>
  <aside
    class="h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all"
    :class="collapsed ? 'w-16' : 'w-56'"
  >
    <div class="h-14 px-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
      <span v-if="!collapsed" class="text-sm font-semibold">AI 写作</span>
      <button
        type="button"
        class="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-900"
        @click="collapsed = !collapsed"
      >
        <span class="text-xs">{{ collapsed ? '>' : '<' }}</span>
      </button>
    </div>

    <nav class="p-2 space-y-1">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="h-10 px-2 rounded-md flex items-center gap-2 text-sm transition-colors"
        :class="$route.path === item.to ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' : 'hover:bg-slate-100 dark:hover:bg-slate-900'"
        :title="collapsed ? item.label : ''"
      >
        <span class="size-4 shrink-0 inline-flex items-center justify-center text-xs">•</span>
        <span v-if="!collapsed">{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

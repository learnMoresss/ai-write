<script setup lang="ts">
const collapsed = defineModel<boolean>('collapsed', { default: false })

const items = [
  { label: '作家工坊', to: '/', icon: 'i-lucide-feather' },
  { label: '文风', to: '/styles', icon: 'i-lucide-pen-tool' },
  { label: '设置', to: '/settings', icon: 'i-lucide-settings' }
]
</script>

<template>
  <aside
    class="h-screen border-r border-slate-200/60 dark:border-slate-700/60 bg-white/30 dark:bg-slate-900/30 backdrop-blur sticky top-0"
    :class="collapsed ? 'w-16' : 'w-64'"
  >
    <div class="h-16 px-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60">
      <div v-if="!collapsed" class="flex items-center gap-2">
        <span class="text-xl">✍️</span>
        <span class="text-lg font-bold text-slate-800 dark:text-slate-100">创作空间</span>
      </div>
      <button
        type="button"
        class="h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        @click="collapsed = !collapsed"
      >
        <UIcon :name="collapsed ? 'i-lucide-arrow-right-from-line' : 'i-lucide-arrow-left-to-line'" class="text-lg" />
      </button>
    </div>

    <nav class="p-3 space-y-1">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="h-12 px-3 rounded-lg flex items-center gap-3 text-sm transition-colors group relative"
        :class="$route.path === item.to ? 'bg-linear-to-r from-teal-50 to-cyan-50 text-teal-700 dark:from-teal-900/30 dark:to-cyan-900/30 dark:text-teal-300 border border-teal-200/50 dark:border-teal-700/30' : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70'"
        :title="item.label"
      >
        <UIcon :name="item.icon" class="text-slate-600 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors shrink-0" />
        <span v-if="!collapsed" class="font-medium truncate">{{ item.label }}</span>

        <!-- 在收起状态下显示工具提示 -->
        <div v-if="collapsed" class="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-2 py-1.5 rounded bg-slate-800 text-white text-xs whitespace-nowrap shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {{ item.label }}
        </div>
      </NuxtLink>
    </nav>
  </aside>
</template>

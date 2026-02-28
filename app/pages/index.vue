<!-- pages/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <UPageHero>
      <template #title>
        AI 小说创作平台
      </template>
      <template #description>
        利用人工智能技术辅助创作逻辑严密的长篇小说，从概念到成品一站式解决方案
      </template>
    </UPageHero>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <UCard>
        <template #header>
          <div class="flex items-center space-x-3">
            <UIcon name="i-heroicons-rocket-launch" class="w-6 h-6 text-primary-500" />
            <h3 class="text-lg font-semibold">快速开始</h3>
          </div>
        </template>

        <p class="text-gray-600 mb-4">
          输入简单的背景概念，AI将为您生成完整的世界观、人物关系和剧情大纲
        </p>

        <UButton
          to="/stories/create"
          color="primary"
          class="w-full"
        >
          开始新故事
        </UButton>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center space-x-3">
            <UIcon name="i-heroicons-rectangle-stack" class="w-6 h-6 text-primary-500" />
            <h3 class="text-lg font-semibold">实体关系图</h3>
          </div>
        </template>

        <p class="text-gray-600 mb-4">
          可视化的人物、地点、物品关系图谱，助您理清复杂的故事线
        </p>

        <UButton
          to="/ai-tools/entity-graph"
          color="primary"
          class="w-full"
          variant="outline"
        >
          查看关系图
        </UButton>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center space-x-3">
            <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-primary-500" />
            <h3 class="text-lg font-semibold">AI 优化器</h3>
          </div>
        </template>

        <p class="text-gray-600 mb-4">
          基于您的创意输入，智能优化世界观细节和剧情发展
        </p>

        <UButton
          to="/ai-tools/world-builder"
          color="primary"
          class="w-full"
          variant="outline"
        >
          优化世界观
        </UButton>
      </UCard>
    </div>

    <div class="mt-16">
      <h2 class="text-2xl font-bold mb-8 text-center">创作流程</h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="mx-auto w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
            <span class="text-primary-600 font-bold text-xl">1</span>
          </div>
          <h3 class="font-semibold mb-2">种子期</h3>
          <p class="text-sm text-gray-600">输入简短背景概念，如"赛博朋克+修仙"</p>
        </div>

        <div class="text-center">
          <div class="mx-auto w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
            <span class="text-primary-600 font-bold text-xl">2</span>
          </div>
          <h3 class="font-semibold mb-2">基建期</h3>
          <p class="text-sm text-gray-600">AI扩充世界观，生成人物关系拓扑图</p>
        </div>

        <div class="text-center">
          <div class="mx-auto w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
            <span class="text-primary-600 font-bold text-xl">3</span>
          </div>
          <h3 class="font-semibold mb-2">编排期</h3>
          <p class="text-sm text-gray-600">生成故事线与触发器，规划情节发展</p>
        </div>

        <div class="text-center">
          <div class="mx-auto w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
            <span class="text-primary-600 font-bold text-xl">4</span>
          </div>
          <h3 class="font-semibold mb-2">生成期</h3>
          <p class="text-sm text-gray-600">AI生成内容，通过审批角色校验质量</p>
        </div>
      </div>
    </div>

    <div class="mt-16">
      <h2 class="text-2xl font-bold mb-8 text-center">近期故事</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard v-for="story in recentStories" :key="story.id">
          <div>
            <h3 class="font-bold text-lg mb-2">{{ story.title }}</h3>
            <p class="text-gray-600 text-sm mb-4">{{ story.description }}</p>

            <div class="flex justify-between items-center text-xs">
              <span :class="getStatusClass(story.status)">
                {{ getStatusText(story.status) }}
              </span>
              <span>{{ formatDate(story.updatedAt) }}</span>
            </div>
          </div>

          <template #footer>
            <div class="flex space-x-2">
              <UButton
                size="sm"
                color="primary"
                class="flex-1"
                :to="`/stories/${story.id}`"
              >
                继续编辑
              </UButton>
              <UButton
                size="sm"
                color="gray"
                variant="ghost"
                @click="viewStory(story.id)"
              >
                预览
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStoryStore } from '~/stores/story'

const storyStore = useStoryStore()

// 模拟最近的故事数据（实际应用中应该从store获取）
const recentStories = computed(() => {
  if (storyStore.stories.length > 0) {
    return storyStore.stories.slice(0, 3)
  }

  // 默认显示示例故事
  return [
    {
      id: 'demo-1',
      title: '赛博修仙传',
      description: '在高科技与古老修仙并存的世界中，一个普通程序员意外踏入修仙之路...',
      status: 'in-progress',
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 'demo-2',
      title: '星辰魔法师',
      description: '魔法与科技碰撞的宇宙，年轻魔法师探索星际奥秘的冒险之旅...',
      status: 'draft',
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'demo-3',
      title: '古代机械师',
      description: '架空古代世界中，一名拥有现代机械知识的穿越者引发的技术革命...',
      status: 'completed',
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ]
})

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    'in-progress': '进行中',
    completed: '已完成'
  }
  return statusMap[status] || status
}

// 获取状态样式类
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    draft: 'text-yellow-600 bg-yellow-100',
    'in-progress': 'text-blue-600 bg-blue-100',
    completed: 'text-green-600 bg-green-100'
  }
  return `inline-block px-2 py-1 rounded ${classMap[status]}`
}

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 查看故事
const viewStory = (id: string) => {
  console.log(`预览故事: ${id}`)
  // 在实际应用中，这里可能会打开一个预览窗口
}

// 设置页面标题
useSeoMeta({
  title: 'AI 小说创作平台',
  description: '利用人工智能技术辅助创作逻辑严密的长篇小说'
})
</script>

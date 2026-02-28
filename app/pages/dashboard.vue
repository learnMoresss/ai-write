<template>
  <div class="dashboard">
    <UPageHero
      title="AI小说创作平台"
      description="一个智能化的小说创作辅助平台，帮助您构建世界观、管理角色关系、规划剧情发展"
    >
      <template #links>
        <UButton to="/stories" icon="i-heroicons-document-text" size="lg">
          开始创作
        </UButton>
        <UButton to="/ai-tools/world-builder" icon="i-heroicons-wrench-screwdriver" variant="outline" size="lg">
          AI工具箱
        </UButton>
      </template>
    </UPageHero>

    <UContainer class="py-12">
      <div class="stats-grid">
        <UCard>
          <div class="stat-item">
            <UIcon name="i-heroicons-book-open" class="stat-icon text-blue-500" />
            <div>
              <p class="stat-number">{{ stats.storyCount }}</p>
              <p class="stat-label">创作故事</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="stat-item">
            <UIcon name="i-heroicons-user" class="stat-icon text-green-500" />
            <div>
              <p class="stat-number">{{ stats.characterCount }}</p>
              <p class="stat-label">角色数量</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="stat-item">
            <UIcon name="i-heroicons-map-pin" class="stat-icon text-purple-500" />
            <div>
              <p class="stat-number">{{ stats.locationCount }}</p>
              <p class="stat-label">地点数量</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="stat-item">
            <UIcon name="i-heroicons-link" class="stat-icon text-amber-500" />
            <div>
              <p class="stat-number">{{ stats.relationshipCount }}</p>
              <p class="stat-label">关系连接</p>
            </div>
          </div>
        </UCard>
      </div>

      <div class="features-grid mt-12">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">世界观构建</h3>
          </template>
          <p>使用AI技术快速构建丰富详实的世界观，包含地理、政治、修炼体系等元素。</p>
          <UButton
            to="/ai-tools/world-builder"
            icon="i-heroicons-magic-wand"
            color="primary"
            class="mt-4"
            block
          >
            开始构建
          </UButton>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">角色管理</h3>
          </template>
          <p>可视化管理小说中的角色，包括属性、关系、发展历程等信息。</p>
          <UButton
            to="/stories"
            icon="i-heroicons-users"
            color="primary"
            class="mt-4"
            block
          >
            管理角色
          </UButton>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">剧情规划</h3>
          </template>
          <p>设计剧情触发器和事件，通过可视化的图表管理故事发展脉络。</p>
          <UButton
            to="/stories"
            icon="i-heroicons-chart-bar"
            color="primary"
            class="mt-4"
            block
          >
            规划剧情
          </UButton>
        </UCard>
      </div>
    </UContainer>

    <UContainer class="py-12">
      <div class="recent-section">
        <h2 class="text-2xl font-bold mb-6">最近的故事</h2>

        <div v-if="recentStories.length === 0" class="empty-state">
          <UIcon name="i-heroicons-document-text" class="empty-icon" />
          <h3 class="empty-title">还没有故事</h3>
          <p class="empty-description">开始您的第一个故事创作之旅</p>
          <UButton to="/stories/create" icon="i-heroicons-plus" color="primary" class="mt-4">
            创建故事
          </UButton>
        </div>

        <div v-else class="stories-grid">
          <UCard
            v-for="story in recentStories"
            :key="story.id"
            @click="goToStory(story.id)"
            class="story-card"
          >
            <template #header>
              <div class="story-header">
                <h3 class="story-title">{{ story.title }}</h3>
                <UBadge :color="getStatusColor(story.status)">
                  {{ getStatusText(story.status) }}
                </UBadge>
              </div>
            </template>

            <p class="story-description">{{ story.description }}</p>

            <div class="story-meta">
              <span class="meta-item">
                <UIcon name="i-heroicons-user" class="meta-icon" />
                {{ getEntityCount(story, 'character') }} 角色
              </span>
              <span class="meta-item">
                <UIcon name="i-heroicons-link" class="meta-icon" />
                {{ getRelationshipCount(story) }} 关系
              </span>
              <span class="meta-item">
                <UIcon name="i-heroicons-clock" class="meta-icon" />
                {{ formatDate(story.updatedAt) }}
              </span>
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useStoryState } from '~/composables/useStoryState'
import type { Story } from '~/types/story'

definePageMeta({
  layout: 'story-editor'
})

const { currentStory, allStories, loadStories, getStoryStats } = useStoryState()

// 统计数据
const stats = reactive({
  storyCount: 0,
  characterCount: 0,
  locationCount: 0,
  relationshipCount: 0
})

// 最近的故事
const recentStories = ref<Story[]>([])

// 计算属性
const hasStories = computed(() => allStories.value.length > 0)

// 方法
const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'gray'
    case 'in-progress':
      return 'blue'
    case 'completed':
      return 'green'
    case 'archived':
      return 'purple'
    default:
      return 'gray'
  }
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'draft': '草稿',
    'in-progress': '进行中',
    'completed': '已完成',
    'archived': '已归档'
  }
  return statusMap[status] || status
}

const getEntityCount = (story: Story, type: string) => {
  if (!story.entities) return 0
  return story.entities.filter(e => e.type === type).length
}

const getRelationshipCount = (story: Story) => {
  return story.relationships ? story.relationships.length : 0
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const goToStory = (id: string) => {
  navigateTo(`/stories/${id}`)
}

// 加载数据
onMounted(async () => {
  await loadStories()

  // 更新统计数据
  stats.storyCount = allStories.value.length

  // 计算角色和地点总数
  let totalCharacters = 0
  let totalLocations = 0
  let totalRelationships = 0

  for (const story of allStories.value) {
    if (story.entities) {
      totalCharacters += story.entities.filter(e => e.type === 'character').length
      totalLocations += story.entities.filter(e => e.type === 'location').length
    }

    if (story.relationships) {
      totalRelationships += story.relationships.length
    }
  }

  stats.characterCount = totalCharacters
  stats.locationCount = totalLocations
  stats.relationshipCount = totalRelationships

  // 获取最近的5个故事
  recentStories.value = [...allStories.value]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 0.75rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 2rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.recent-section .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.story-card {
  cursor: pointer;
  transition: all 0.2s;
}

.story-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.story-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.story-description {
  color: #64748b;
  margin-bottom: 1rem;
}

.story-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  color: #64748b;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-icon {
  width: 1rem;
  height: 1rem;
}
</style>
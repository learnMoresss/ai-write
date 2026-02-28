<template>
  <div class="stories-page">
    <UPageHero
      title="我的故事"
      description="管理您的小说创作项目"
    >
      <template #links>
        <UButton to="/stories/create" icon="i-heroicons-plus" size="lg" color="primary">
          创建新故事
        </UButton>
        <UButton icon="i-heroicons-arrow-down-tray" variant="outline" size="lg">
          导入故事
        </UButton>
      </template>
    </UPageHero>

    <UContainer class="py-8">
      <!-- 搜索和筛选 -->
      <div class="filters mb-6">
        <div class="search-box">
          <UInput
            v-model="searchQuery"
            placeholder="搜索故事..."
            icon="i-heroicons-magnifying-glass"
            size="lg"
          />
        </div>

        <div class="filter-options">
          <USelectMenu
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="状态筛选"
            class="mr-3"
          />
          <USelectMenu
            v-model="sortBy"
            :options="sortOptions"
            placeholder="排序方式"
          />
        </div>
      </div>

      <!-- 故事统计 -->
      <div class="stats mb-8">
        <div class="stat-card">
          <UIcon name="i-heroicons-document-text" class="stat-icon text-blue-500" />
          <div>
            <p class="stat-number">{{ stories.length }}</p>
            <p class="stat-label">总故事数</p>
          </div>
        </div>
        <div class="stat-card">
          <UIcon name="i-heroicons-user" class="stat-icon text-green-500" />
          <div>
            <p class="stat-number">{{ totalCharacters }}</p>
            <p class="stat-label">总角色数</p>
          </div>
        </div>
        <div class="stat-card">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="stat-icon text-purple-500" />
          <div>
            <p class="stat-number">{{ totalPlotEvents }}</p>
            <p class="stat-label">总剧情事件</p>
          </div>
        </div>
        <div class="stat-card">
          <UIcon name="i-heroicons-chart-bar" class="stat-icon text-amber-500" />
          <div>
            <p class="stat-number">{{ activeStories }}</p>
            <p class="stat-label">进行中</p>
          </div>
        </div>
      </div>

      <!-- 故事列表 -->
      <div v-if="filteredStories.length === 0" class="empty-state">
        <UIcon name="i-heroicons-document-text" class="empty-icon" />
        <h3 class="empty-title">还没有故事</h3>
        <p class="empty-description">创建您的第一个故事开始创作之旅</p>
        <UButton to="/stories/create" icon="i-heroicons-plus" color="primary" class="mt-4">
          创建故事
        </UButton>
      </div>

      <div v-else class="stories-grid">
        <UCard
          v-for="story in paginatedStories"
          :key="story.id"
          class="story-card"
        >
          <template #header>
            <div class="card-header">
              <div class="title-section">
                <h3 class="story-title">{{ story.title }}</h3>
                <UBadge :color="getStatusColor(story.status)" size="sm">
                  {{ getStatusText(story.status) }}
                </UBadge>
              </div>
              <div class="actions">
                <UButton
                  @click="openShareModal(story)"
                  icon="i-heroicons-share"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                />
                <UButton
                  @click="duplicateStory(story)"
                  icon="i-heroicons-document-duplicate"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                />
                <UButton
                  @click="confirmDeleteStory(story)"
                  icon="i-heroicons-trash"
                  size="xs"
                  variant="ghost"
                  color="red"
                />
              </div>
            </div>
          </template>

          <p class="story-description">{{ story.description }}</p>

          <div class="story-stats">
            <div class="stat-item">
              <UIcon name="i-heroicons-user" class="stat-icon" />
              <span>{{ story.entities ? story.entities.length : 0 }} 个实体</span>
            </div>
            <div class="stat-item">
              <UIcon name="i-heroicons-link" class="stat-icon" />
              <span>{{ story.relationships ? story.relationships.length : 0 }} 个关系</span>
            </div>
            <div class="stat-item">
              <UIcon name="i-heroicons-chat-bubble-left-right" class="stat-icon" />
              <span>{{ story.plotEvents ? story.plotEvents.length : 0 }} 个事件</span>
            </div>
          </div>

          <div class="story-meta">
            <span class="meta-item">
              <UIcon name="i-heroicons-calendar" class="meta-icon" />
              {{ formatDate(story.createdAt) }}
            </span>
            <span class="meta-item">
              <UIcon name="i-heroicons-clock" class="meta-icon" />
              更新于 {{ formatDate(story.updatedAt) }}
            </span>
          </div>

          <template #footer>
            <div class="card-footer">
              <UButton
                @click="viewStory(story)"
                icon="i-heroicons-eye"
                color="primary"
                class="mr-2"
              >
                查看故事
              </UButton>
              <UButton
                @click="editStory(story)"
                icon="i-heroicons-pencil"
                variant="outline"
              >
                编辑
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <!-- 分页 -->
      <UPagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :page-count="totalPages"
        :boundary-count="1"
        :ellipsis="true"
        class="mt-8 justify-center"
      />
    </UContainer>

    <!-- 删除确认对话框 -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="font-bold">确认删除</h3>
        </template>

        <p>确定要删除故事 "{{ storyToDelete?.title }}" 吗？此操作无法撤销。</p>

        <template #footer>
          <div class="flex justify-end space-x-3">
            <UButton @click="showDeleteModal = false" color="neutral" variant="outline">
              取消
            </UButton>
            <UButton @click="deleteStoryConfirmed" color="red">
              确认删除
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- 分享对话框 -->
    <UModal v-model="showShareModal">
      <UCard>
        <template #header>
          <h3 class="font-bold">分享故事</h3>
        </template>

        <div class="share-content">
          <UInput :model-value="currentShareUrl" readonly class="mb-3" />
          <UButton @click="copyShareUrl" block :color="copySuccess ? 'green' : 'primary'">
            <UIcon :name="copySuccess ? 'i-heroicons-check' : 'i-heroicons-clipboard'" class="mr-2" />
            {{ copySuccess ? '已复制!' : '复制链接' }}
          </UButton>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton @click="showShareModal = false" color="neutral" variant="outline">
              关闭
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useStoryState } from '~/composables/useStoryState'
import type { Story } from '~/types/story'

definePageMeta({
  layout: 'story-editor'
})

const { allStories, loadStories, deleteStory } = useStoryState()

// 响应式数据
const stories = ref<Story[]>([])
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('updatedAt')
const currentPage = ref(1)
const pageSize = ref(6)
const showDeleteModal = ref(false)
const storyToDelete = ref<Story | null>(null)
const showShareModal = ref(false)
const currentShareUrl = ref('')
const copySuccess = ref(false)

// 计算属性
const filteredStories = computed(() => {
  let result = stories.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(story =>
      story.title.toLowerCase().includes(query) ||
      story.description.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(story => story.status === statusFilter.value)
  }

  // 排序
  result.sort((a, b) => {
    if (sortBy.value === 'title') {
      return a.title.localeCompare(b.title)
    } else if (sortBy.value === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredStories.value.length / pageSize.value)
})

const paginatedStories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStories.value.slice(start, start + pageSize.value)
})

const totalCharacters = computed(() => {
  return stories.value.reduce((sum, story) => {
    if (story.entities) {
      return sum + story.entities.filter(e => e.type === 'character').length
    }
    return sum
  }, 0)
})

const totalPlotEvents = computed(() => {
  return stories.value.reduce((sum, story) => {
    return sum + (story.plotEvents ? story.plotEvents.length : 0)
  }, 0)
})

const activeStories = computed(() => {
  return stories.value.filter(story => story.status === 'in-progress').length
})

// 选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'completed' },
  { label: '已归档', value: 'archived' }
]

const sortOptions = [
  { label: '最近更新', value: 'updatedAt' },
  { label: '最新创建', value: 'createdAt' },
  { label: '标题', value: 'title' }
]

// 方法
const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'gray'
    case 'in-progress': return 'blue'
    case 'completed': return 'green'
    case 'archived': return 'purple'
    default: return 'gray'
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewStory = (story: Story) => {
  navigateTo(`/stories/${story.id}`)
}

const editStory = (story: Story) => {
  navigateTo(`/stories/${story.id}/edit`)
}

const confirmDeleteStory = (story: Story) => {
  storyToDelete.value = story
  showDeleteModal.value = true
}

const deleteStoryConfirmed = async () => {
  if (storyToDelete.value) {
    try {
      await deleteStory(storyToDelete.value.id)
      // 重新加载故事列表
      await loadStories()
      stories.value = allStories.value
    } catch (error) {
      console.error('Failed to delete story:', error)
      // 显示错误消息
    } finally {
      showDeleteModal.value = false
      storyToDelete.value = null
    }
  }
}

const openShareModal = (story: Story) => {
  currentShareUrl.value = `${window.location.origin}/stories/${story.id}`
  showShareModal.value = true
  copySuccess.value = false
}

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(currentShareUrl.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy URL:', err)
  }
}

const duplicateStory = (story: Story) => {
  // 创建故事副本的逻辑
  const duplicatedStory = {
    ...story,
    id: crypto.randomUUID(),
    title: `${story.title} (副本)`,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // 在这里可以添加保存副本的逻辑
  console.log('Duplicating story:', duplicatedStory)
}

// 加载故事数据
onMounted(async () => {
  await loadStories()
  stories.value = allStories.value
})
</script>

<style scoped>
.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-box {
  flex: 1;
  min-width: 300px;
}

.filter-options {
  display: flex;
  gap: 1rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  background-color: #f1f5f9;
  border-radius: 0.5rem;
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

.empty-state {
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.story-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.actions {
  display: flex;
  gap: 0.25rem;
}

.story-description {
  color: #64748b;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.story-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #64748b;
}

.stat-icon {
  width: 1rem;
  height: 1rem;
}

.story-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  color: #6b7280;
  font-size: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
}

.share-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
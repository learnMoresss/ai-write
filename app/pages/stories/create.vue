<template>
  <div class="create-story-page">
    <UPageHero
      title="创建新故事"
      description="开始您的创作之旅"
    />

    <UContainer class="py-8">
      <div class="create-form">
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">故事基本信息</h2>
          </template>

          <UForm :state="storyForm" @submit="createStory" class="space-y-6">
            <UFormGroup label="故事标题" name="title" required class="mb-4">
              <UInput
                v-model="storyForm.title"
                placeholder="输入故事标题"
                size="lg"
              />
            </UFormGroup>

            <UFormGroup label="故事描述" name="description" class="mb-4">
              <UTextarea
                v-model="storyForm.description"
                placeholder="简要描述您的故事..."
                rows="4"
              />
            </UFormGroup>

            <UFormGroup label="故事类型" name="genre" class="mb-4">
              <USelectMenu
                v-model="storyForm.genre"
                :options="genreOptions"
                placeholder="选择故事类型"
              />
            </UFormGroup>

            <UFormGroup label="初始世界观" name="initialWorld" class="mb-4">
              <USelectMenu
                v-model="storyForm.initialWorld"
                :options="worldOptions"
                placeholder="选择初始世界观模板或创建自定义"
              />
            </UFormGroup>

            <UFormGroup
              v-if="storyForm.initialWorld === 'custom'"
              label="自定义世界观概念"
              name="worldConcept"
              class="mb-4"
            >
              <UTextarea
                v-model="storyForm.worldConcept"
                placeholder="描述您想要的世界观概念，如：'赛博朋克+修仙' 或 '维多利亚时代的魔法学院'"
                rows="3"
              />
            </UFormGroup>

            <UFormGroup label="初始实体数量预估" name="entityEstimate" class="mb-4">
              <URange
                v-model="storyForm.entityEstimate"
                :min="1"
                :max="100"
                :step="1"
                size="sm"
              />
              <div class="range-value">{{ storyForm.entityEstimate }} 个实体</div>
            </UFormGroup>

            <template #footer>
              <div class="flex justify-end space-x-3">
                <UButton
                  @click="cancelCreation"
                  color="neutral"
                  variant="outline"
                >
                  取消
                </UButton>
                <UButton
                  type="submit"
                  color="primary"
                  :loading="isCreating"
                  :disabled="!isValid"
                >
                  创建故事
                </UButton>
              </div>
            </template>
          </UForm>
        </UCard>

        <!-- AI辅助创建选项 -->
        <UCard class="mt-6">
          <template #header>
            <h2 class="text-xl font-semibold">AI辅助创建</h2>
          </template>

          <div class="ai-assistance">
            <p class="mb-4">使用AI帮您生成故事概念或世界观：</p>

            <div class="ai-options">
              <UButton
                @click="generateIdeas"
                icon="i-heroicons-light-bulb"
                color="amber"
                variant="outline"
                :loading="isGenerating"
              >
                生成故事创意
              </UButton>

              <UButton
                @click="generateWorldConcept"
                icon="i-heroicons-globe-alt"
                color="green"
                variant="outline"
                :loading="isGenerating"
              >
                生成世界观概念
              </UButton>

              <UButton
                @click="generateCharacterConcepts"
                icon="i-heroicons-user"
                color="blue"
                variant="outline"
                :loading="isGenerating"
              >
                生成角色概念
              </UButton>
            </div>

            <div v-if="aiSuggestions" class="ai-suggestions mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 class="font-medium text-blue-800 mb-2">AI建议:</h3>
              <p class="text-blue-700">{{ aiSuggestions }}</p>
              <UButton
                v-if="aiSuggestions"
                @click="applyAISuggestion"
                icon="i-heroicons-check"
                color="blue"
                size="sm"
                class="mt-2"
              >
                采用建议
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useStoryState } from '~/composables/useStoryState'
import { useAiIntegration } from '~/composables/useAiIntegration'

definePageMeta({
  layout: 'story-editor'
})

const { createStory: createStoryInStore } = useStoryState()
const { sendPrompt, isProcessing } = useAiIntegration()

// 响应式数据
const storyForm = reactive({
  title: '',
  description: '',
  genre: '',
  initialWorld: 'default',
  worldConcept: '',
  entityEstimate: 10
})

const isCreating = ref(false)
const isGenerating = ref(false)
const aiSuggestions = ref('')

// 选项
const genreOptions = [
  { label: '奇幻', value: 'fantasy' },
  { label: '科幻', value: 'sci-fi' },
  { label: '悬疑', value: 'mystery' },
  { label: '浪漫', value: 'romance' },
  { label: '恐怖', value: 'horror' },
  { label: '历史', value: 'historical' },
  { label: '现代都市', value: 'contemporary' },
  { label: '武侠仙侠', value: 'wuxia-xianxia' },
  { label: '游戏异界', value: 'game-isekai' },
  { label: '自定义', value: 'custom' }
]

const worldOptions = [
  { label: '默认模板', value: 'default' },
  { label: '奇幻世界', value: 'fantasy' },
  { label: '科幻世界', value: 'sci-fi' },
  { label: '赛博朋克', value: 'cyberpunk' },
  { label: '武侠世界', value: 'wuxia' },
  { label: '自定义', value: 'custom' }
]

// 计算属性
const isValid = computed(() => {
  return storyForm.title.trim() !== ''
})

// 方法
const createStory = async () => {
  isCreating.value = true

  try {
    // 创建故事对象
    const newStoryData = {
      title: storyForm.title,
      description: storyForm.description,
      genre: storyForm.genre,
      entityEstimate: storyForm.entityEstimate
    }

    // 调用store创建故事
    const createdStory = await createStoryInStore(
      storyForm.title,
      storyForm.description
    )

    // 根据选择的世界观模板或自定义概念初始化世界观
    if (storyForm.initialWorld === 'custom' && storyForm.worldConcept) {
      // 这里可以调用世界观生成逻辑
      console.log('Using custom world concept:', storyForm.worldConcept)
    }

    // 导航到新创建的故事页面
    await navigateTo(`/stories/${createdStory.id}`)
  } catch (error) {
    console.error('Failed to create story:', error)
    // 这里可以添加错误处理，比如显示错误消息
  } finally {
    isCreating.value = false
  }
}

const cancelCreation = () => {
  // 返回到故事列表页面
  navigateTo('/stories')
}

const generateIdeas = async () => {
  isGenerating.value = true
  try {
    const prompt = "生成一个有趣的小说创意，包含故事类型、核心冲突和主要角色设定。"
    const response = await sendPrompt(prompt)
    aiSuggestions.value = response.content || "AI生成的故事创意"
  } catch (error) {
    console.error('Failed to generate ideas:', error)
    aiSuggestions.value = '生成创意时出现错误，请稍后再试。'
  } finally {
    isGenerating.value = false
  }
}

const generateWorldConcept = async () => {
  isGenerating.value = true
  try {
    const prompt = "生成一个独特的小说世界观概念，包含地理、文化和基本设定。"
    const response = await sendPrompt(prompt)
    aiSuggestions.value = response.content || "AI生成的世界观概念"
  } catch (error) {
    console.error('Failed to generate world concept:', error)
    aiSuggestions.value = '生成世界观时出现错误，请稍后再试。'
  } finally {
    isGenerating.value = false
  }
}

const generateCharacterConcepts = async () => {
  isGenerating.value = true
  try {
    const prompt = "生成2-3个有趣的角色概念，包括角色背景、动机和特点。"
    const response = await sendPrompt(prompt)
    aiSuggestions.value = response.content || "AI生成的角色概念"
  } catch (error) {
    console.error('Failed to generate character concepts:', error)
    aiSuggestions.value = '生成角色概念时出现错误，请稍后再试。'
  } finally {
    isGenerating.value = false
  }
}

const applyAISuggestion = () => {
  if (aiSuggestions.value) {
    // 将AI建议填充到表单中（根据需要调整具体字段）
    if (!storyForm.title) {
      // 简单提取标题（实际可能需要更复杂的解析）
      const titleMatch = aiSuggestions.value.match(/^([^.,!\n]+)/)
      if (titleMatch) {
        storyForm.title = titleMatch[1].substring(0, 50) // 限制长度
      }
    }

    if (!storyForm.description) {
      storyForm.description = aiSuggestions.value.substring(0, 200) + '...'
    }
  }
}
</script>

<style scoped>
.create-form {
  max-width: 800px;
  margin: 0 auto;
}

.range-value {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.ai-assistance {
  display: flex;
  flex-direction: column;
}

.ai-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.ai-suggestions {
  border-left: 4px solid #3b82f6;
}
</style>
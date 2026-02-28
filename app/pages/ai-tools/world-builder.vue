<template>
  <div class="world-builder-page">
    <UPageHero
      title="AI世界观构建器"
      description="使用AI技术快速构建丰富详实的世界观"
    />

    <UContainer class="py-8">
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">世界观构建</h2>
        </template>

        <div class="builder-content">
          <div class="input-section">
            <h3>输入您的概念</h3>
            <UTextarea
              v-model="worldConcept"
              placeholder="描述您想要的世界观概念，例如：'赛博朋克+修仙' 或 '维多利亚时代的魔法学院'"
              rows="5"
              class="mb-4"
            />

            <div class="options-grid">
              <UFormGroup label="扩展级别" name="expansionLevel">
                <USelect
                  v-model="expansionLevel"
                  :options="expansionLevels"
                  placeholder="选择扩展级别"
                />
              </UFormGroup>

              <UFormGroup label="关注领域" name="focusArea">
                <USelect
                  v-model="focusArea"
                  :options="focusAreas"
                  placeholder="选择关注领域"
                />
              </UFormGroup>

              <UFormGroup label="自定义指令" name="customInstructions">
                <UInput
                  v-model="customInstructions"
                  placeholder="额外的定制要求..."
                />
              </UFormGroup>
            </div>

            <UButton
              @click="buildWorld"
              :disabled="!worldConcept || isBuilding"
              :loading="isBuilding"
              color="primary"
              class="mt-4"
              icon="i-heroicons-bolt"
            >
              生成世界观
            </UButton>
          </div>

          <div class="preview-section" v-if="builtWorld">
            <h3>生成的世界观</h3>

            <div class="world-details">
              <div class="detail-item">
                <h4>世界观名称</h4>
                <p>{{ builtWorld.name }}</p>
              </div>

              <div class="detail-item">
                <h4>世界观描述</h4>
                <p>{{ builtWorld.description }}</p>
              </div>

              <div class="detail-item" v-if="builtWorld.geography">
                <h4>地理环境</h4>
                <p>{{ builtWorld.geography }}</p>
              </div>

              <div class="detail-item" v-if="builtWorld.politicalSystem">
                <h4>政治体系</h4>
                <p>{{ builtWorld.politicalSystem }}</p>
              </div>

              <div class="detail-item" v-if="builtWorld.cultivationSystem">
                <h4>修炼体系</h4>
                <p>{{ builtWorld.cultivationSystem }}</p>
              </div>

              <div class="detail-item" v-if="builtWorld.magicSystem">
                <h4>法术体系</h4>
                <p>{{ builtWorld.magicSystem }}</p>
              </div>

              <div class="detail-item" v-if="builtWorld.technologyLevel">
                <h4>科技水平</h4>
                <p>{{ builtWorld.technologyLevel }}</p>
              </div>

              <div class="detail-item" v-if="builtWorld.uniqueFeatures && builtWorld.uniqueFeatures.length > 0">
                <h4>独特特色</h4>
                <ul>
                  <li v-for="(feature, index) in builtWorld.uniqueFeatures" :key="index">
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="actions">
              <UButton
                @click="useWorld"
                icon="i-heroicons-check-circle"
                color="green"
              >
                采用此世界观
              </UButton>
              <UButton
                @click="optimizeWorld"
                icon="i-heroicons-adjustments-horizontal"
                variant="outline"
              >
                优化一致性
              </UButton>
              <UButton
                @click="exportWorld"
                icon="i-heroicons-arrow-down-tray"
                variant="outline"
              >
                导出
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- 进度指示器 -->
      <UModal v-model="showProgress" :overlay="true">
        <UCard>
          <template #header>
            <h3 class="font-bold">正在构建世界观</h3>
          </template>

          <div class="progress-content">
            <UProgress :value="progress" size="sm" indicator />
            <p class="progress-text">{{ progressText }}</p>
          </div>
        </UCard>
      </UModal>

      <!-- 日志面板 -->
      <UCard v-if="buildLog.length > 0" class="mt-6">
        <template #header>
          <h3 class="text-lg font-semibold">构建日志</h3>
        </template>

        <div class="log-container">
          <div
            v-for="(log, index) in buildLog"
            :key="index"
            :class="['log-entry', log.type]"
          >
            <UIcon :name="getLogIcon(log.type)" class="log-icon mr-2" />
            <span>{{ log.message }}</span>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useWorldBuilding } from '~/composables/useWorldBuilding'
import type { WorldSetting } from '~/types/story'

definePageMeta({
  layout: 'story-editor'
})

const {
  buildWorldFromSeed,
  expandWorldSetting,
  optimizeWorldConsistency,
  validateWorldCompleteness,
  isBuilding,
  buildProgress,
  buildLog
} = useWorldBuilding()

// 响应式数据
const worldConcept = ref('')
const expansionLevel = ref<'basic' | 'detailed' | 'comprehensive'>('detailed')
const focusArea = ref<string>('')
const customInstructions = ref('')
const builtWorld = ref<WorldSetting | null>(null)
const showProgress = ref(false)
const progress = ref(0)
const progressText = ref('')

// 选项
const expansionLevels = [
  { label: '基础', value: 'basic' },
  { label: '详细', value: 'detailed' },
  { label: '全面', value: 'comprehensive' }
]

const focusAreas = [
  { label: '全部', value: '' },
  { label: '地理环境', value: 'geography' },
  { label: '政治体系', value: 'political-system' },
  { label: '修炼体系', value: 'cultivation-system' },
  { label: '法术体系', value: 'magic-system' },
  { label: '科技水平', value: 'technology-level' },
  { label: '经济文化', value: 'economy-culture' }
]

// 监听构建进度
watch(isBuilding, (newVal) => {
  showProgress.value = newVal
})

watch(buildProgress, (newProgress) => {
  progress.value = newProgress
})

watch(buildLog, (newLog) => {
  if (newLog && newLog.length > 0) {
    // 更新进度文本为最后一个日志条目
    const lastLog = newLog[newLog.length - 1]
    if (lastLog) {
      progressText.value = lastLog
    }
  }
})

// 方法
const buildWorld = async () => {
  if (!worldConcept.value) return

  try {
    // 准备焦点领域数组
    const focusAreasList = focusArea.value ? [focusArea.value] : undefined

    // 构建世界观
    const world = await buildWorldFromSeed(
      worldConcept.value,
      focusAreasList,
      expansionLevel.value
    )

    builtWorld.value = world
  } catch (error) {
    console.error('Failed to build world:', error)
    // 这里可以添加错误处理
  }
}

const useWorld = () => {
  if (builtWorld.value) {
    // 在这里可以触发采用世界观的逻辑
    console.log('Using world:', builtWorld.value)
    // 可以触发事件或直接在store中设置
  }
}

const optimizeWorld = async () => {
  if (!builtWorld.value) return

  try {
    const optimized = await optimizeWorldConsistency(builtWorld.value)
    builtWorld.value = optimized
    // 添加成功消息到日志
    buildLog.value.push('世界观已优化')
  } catch (error) {
    console.error('Failed to optimize world:', error)
    // 添加错误消息到日志
    buildLog.value.push('优化失败: ' + (error as Error).message)
  }
}

const exportWorld = () => {
  if (builtWorld.value) {
    // 导出为JSON格式
    const dataStr = JSON.stringify(builtWorld.value, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `${builtWorld.value.name}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }
}

const getLogIcon = (type: string) => {
  switch (type) {
    case 'error':
      return 'i-heroicons-exclamation-circle'
    case 'warning':
      return 'i-heroicons-exclamation-triangle'
    case 'success':
      return 'i-heroicons-check-circle'
    default:
      return 'i-heroicons-information-circle'
  }
}
</script>

<style scoped>
.builder-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .builder-content {
    grid-template-columns: 1fr;
  }
}

.input-section h3, .preview-section h3 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.world-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.detail-item h4 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #374151;
}

.detail-item p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.detail-item ul {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
  color: #6b7280;
}

.detail-item li {
  margin-bottom: 0.25rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-text {
  text-align: center;
  color: #6b7280;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
}

.log-entry.info {
  background-color: #f0f9ff;
  color: #0ea5e9;
}

.log-entry.success {
  background-color: #f0fdf4;
  color: #22c55e;
}

.log-entry.warning {
  background-color: #fffbeb;
  color: #f59e0b;
}

.log-entry.error {
  background-color: #fef2f2;
  color: #ef4444;
}

.log-icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
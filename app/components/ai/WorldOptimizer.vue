<template>
  <div class="world-optimizer">
    <div class="toolbar">
      <UInput
        v-model="worldSeed"
        placeholder="输入世界观概念，如：赛博朋克+修仙"
        size="lg"
        class="mb-4"
      />
      <div class="controls">
        <USelect
          v-model="expansionLevel"
          :options="expansionLevels"
          label="扩展级别"
          class="mr-2"
        />
        <USelect
          v-model="focusArea"
          :options="focusAreas"
          label="关注领域"
          class="mr-2"
        />
        <UButton
          :disabled="!worldSeed || generating"
          @click="generateWorld"
          :loading="generating"
          icon="i-heroicons-bolt"
          color="primary"
        >
          生成世界观
        </UButton>
      </div>
    </div>

    <div class="progress" v-if="generating">
      <UProgress :value="progress" size="sm" indicator />
      <p class="progress-text">{{ progressText }}</p>
    </div>

    <div class="world-display" v-if="generatedWorld">
      <UCard>
        <template #header>
          <div class="header">
            <h2>{{ generatedWorld.name }}</h2>
            <UButton
              @click="copyWorld"
              icon="i-heroicons-clipboard-document"
              size="sm"
              color="neutral"
              variant="ghost"
            >
              复制
            </UButton>
          </div>
        </template>

        <div class="world-details">
          <div class="detail-section">
            <h3>世界观描述</h3>
            <p>{{ generatedWorld.description }}</p>
          </div>

          <div class="detail-section" v-if="generatedWorld.geography">
            <h3>地理环境</h3>
            <p>{{ generatedWorld.geography }}</p>
          </div>

          <div class="detail-section" v-if="generatedWorld.politicalSystem">
            <h3>政治体系</h3>
            <p>{{ generatedWorld.politicalSystem }}</p>
          </div>

          <div class="detail-section" v-if="generatedWorld.cultivationSystem">
            <h3>修炼体系</h3>
            <p>{{ generatedWorld.cultivationSystem }}</p>
          </div>

          <div class="detail-section" v-if="generatedWorld.magicSystem">
            <h3>法术体系</h3>
            <p>{{ generatedWorld.magicSystem }}</p>
          </div>

          <div class="detail-section" v-if="generatedWorld.technologyLevel">
            <h3>科技水平</h3>
            <p>{{ generatedWorld.technologyLevel }}</p>
          </div>

          <div class="detail-section" v-if="generatedWorld.uniqueFeatures && generatedWorld.uniqueFeatures.length > 0">
            <h3>独特特色</h3>
            <ul>
              <li v-for="(feature, index) in generatedWorld.uniqueFeatures" :key="index">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>

        <template #footer>
          <div class="footer-actions">
            <UButton
              @click="useWorld"
              icon="i-heroicons-check-circle"
              color="green"
            >
              使用此世界观
            </UButton>
            <UButton
              @click="optimizeConsistency"
              icon="i-heroicons-shield-check"
              color="amber"
              variant="outline"
            >
              优化一致性
            </UButton>
          </div>
        </template>
      </UCard>
    </div>

    <div class="log-panel" v-if="generationLog.length > 0">
      <h3>生成日志</h3>
      <ul>
        <li v-for="(log, index) in generationLog" :key="index" :class="log.type">
          {{ log.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorldBuilding } from '~/composables/useWorldBuilding'
import type { WorldSetting } from '~/types/story'

defineOptions({
  name: 'WorldOptimizer'
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
const worldSeed = ref('')
const expansionLevel = ref<'basic' | 'detailed' | 'comprehensive'>('detailed')
const focusArea = ref<string>('')
const generating = ref(false)
const progress = ref(0)
const progressText = ref('准备生成...')
const generatedWorld = ref<WorldSetting | null>(null)
const generationLog = ref<{ type: string; message: string }[]>([])

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

// 方法
const generateWorld = async () => {
  if (!worldSeed.value) return

  generating.value = true
  progress.value = 0
  generationLog.value = []

  try {
    // 更新进度
    progressText.value = '正在分析种子概念...'
    generationLog.value.push({ type: 'info', message: '开始分析种子概念' })

    // 生成世界
    const focusAreasList = focusArea.value ? [focusArea.value] : undefined

    const world = await buildWorldFromSeed(
      worldSeed.value,
      focusAreasList,
      expansionLevel.value
    )

    generatedWorld.value = world
    generationLog.value.push({ type: 'success', message: '世界观生成完成！' })
  } catch (error: any) {
    console.error('World generation failed:', error)
    generationLog.value.push({ type: 'error', message: `生成失败: ${error.message}` })
  } finally {
    generating.value = false
    progress.value = 100
  }
}

const useWorld = () => {
  if (generatedWorld.value) {
    // 这里应该触发一个事件，让父组件知道用户选择了这个世界观
    emit('world-selected', generatedWorld.value)
  }
}

const optimizeConsistency = async () => {
  if (!generatedWorld.value) return

  try {
    const optimizedWorld = await optimizeWorldConsistency(generatedWorld.value)
    generatedWorld.value = optimizedWorld
    generationLog.value.push({ type: 'info', message: '世界观一致性已优化' })
  } catch (error: any) {
    console.error('Optimization failed:', error)
    generationLog.value.push({ type: 'error', message: `优化失败: ${error.message}` })
  }
}

const copyWorld = () => {
  if (generatedWorld.value) {
    navigator.clipboard.writeText(JSON.stringify(generatedWorld.value, null, 2))
    // 这里可以添加一个提示
  }
}

// 监听构建进度
watch(buildProgress, (newProgress) => {
  progress.value = newProgress
})

watch(buildLog, (newLog) => {
  // 将构建日志同步到本地日志
  if (newLog && newLog.length > 0) {
    // 清除重复项，只保留最后一项
    generationLog.value = newLog.map(log => ({ type: 'info', message: log }))
  }
})

// 定义emit
const emit = defineEmits<{
  'world-selected': [world: WorldSetting]
}>()
</script>

<style scoped>
.world-optimizer {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.toolbar {
  margin-bottom: 1.5rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
  align-items: end;
}

.progress {
  margin: 1.5rem 0;
}

.progress-text {
  margin-top: 0.5rem;
  text-align: center;
  color: #666;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
}

.world-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section h3 {
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

.detail-section ul {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.log-panel {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}

.log-panel h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.log-panel ul {
  margin: 0;
  padding-left: 1.5rem;
}

.log-panel li {
  margin-bottom: 0.25rem;
  padding: 0.25rem 0;
}

.log-panel li.info {
  color: #3b82f6; /* blue */
}

.log-panel li.success {
  color: #10b981; /* green */
}

.log-panel li.warning {
  color: #f59e0b; /* amber */
}

.log-panel li.error {
  color: #ef4444; /* red */
}
</style>
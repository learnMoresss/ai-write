<template>
  <div class="approval-panel">
    <UCard>
      <template #header>
        <div class="header">
          <h2>内容审批面板</h2>
          <UButton
            @click="approveContent"
            :loading="isApproving"
            :disabled="!contentToCheck"
            icon="i-heroicons-check-circle"
            color="green"
          >
            开始审批
          </UButton>
        </div>
      </template>

      <div class="panel-content">
        <div class="input-section">
          <h3>待审批内容</h3>
          <UTextarea
            v-model="contentToCheck"
            placeholder="粘贴需要审批的内容..."
            rows="8"
            class="content-input"
          />
        </div>

        <div class="checks-section">
          <h3>审批检查项</h3>
          <div class="checks-grid">
            <UCheckbox
              v-for="check in availableChecks"
              :key="check.value"
              v-model="selectedChecks"
              :value="check.value"
              :label="check.label"
              :description="check.description"
            />
          </div>
        </div>

        <div class="context-section">
          <h3>审批上下文</h3>
          <div class="context-controls">
            <UButtonGroup class="mb-3">
              <UButton
                :variant="contextTab === 'world' ? 'solid' : 'outline'"
                @click="contextTab = 'world'"
              >
                世界观
              </UButton>
              <UButton
                :variant="contextTab === 'characters' ? 'solid' : 'outline'"
                @click="contextTab = 'characters'"
              >
                角色
              </UButton>
              <UButton
                :variant="contextTab === 'previous' ? 'solid' : 'outline'"
                @click="contextTab = 'previous'"
              >
                前文内容
              </UButton>
            </UButtonGroup>

            <div class="context-content">
              <div v-show="contextTab === 'world'" class="world-context">
                <UTextarea
                  v-model="approvalContext.worldSetting"
                  placeholder="输入当前世界观设定..."
                  rows="5"
                />
              </div>

              <div v-show="contextTab === 'characters'" class="characters-context">
                <UTag
                  v-for="entity in approvalContext.entities"
                  :key="entity.id"
                  :value="entity.label"
                  class="mr-2 mb-2"
                />
                <UButton @click="loadCharacters" icon="i-heroicons-arrow-path" size="xs" />
              </div>

              <div v-show="contextTab === 'previous'" class="previous-context">
                <UTextarea
                  v-model="approvalContext.previousContent"
                  placeholder="输入前文内容作为上下文参考..."
                  rows="5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 审批结果 -->
    <UCard v-if="approvalResult" class="mt-6">
      <template #header>
        <div class="result-header">
          <h3>审批结果</h3>
          <UBadge :color="getResultColor(approvalResult)">
            {{ getResultText(approvalResult) }}
          </UBadge>
        </div>
      </template>

      <div class="result-content">
        <div class="confidence-section mb-4">
          <p><strong>置信度:</strong> {{ Math.round(approvalResult.confidence * 100) }}%</p>
          <UProgress :value="approvalResult.confidence * 100" :color="getConfidenceColor(approvalResult.confidence)" />
        </div>

        <div v-if="approvalResult.issues && approvalResult.issues.length > 0" class="issues-section">
          <h4>发现问题</h4>
          <div
            v-for="(issue, index) in approvalResult.issues"
            :key="index"
            class="issue-card"
            :class="'issue-' + issue.severity"
          >
            <div class="issue-header">
              <div class="issue-type">
                <UIcon :name="getIssueIcon(issue.type)" class="mr-2" />
                <span class="font-semibold">{{ getIssueTypeName(issue.type) }}</span>
              </div>
              <UBadge :color="getIssueSeverityColor(issue.severity)">
                {{ issue.severity.toUpperCase() }}
              </UBadge>
            </div>
            <p class="issue-description">{{ issue.description }}</p>
            <div v-if="issue.suggestedFix" class="issue-fix mt-2 p-3 bg-blue-50 rounded">
              <strong>建议修复:</strong> {{ issue.suggestedFix }}
            </div>
          </div>
        </div>

        <div v-if="approvalResult.suggestions && approvalResult.suggestions.length > 0" class="suggestions-section">
          <h4>改进建议</h4>
          <ul class="suggestions-list">
            <li v-for="(suggestion, index) in approvalResult.suggestions" :key="index">
              <UIcon name="i-heroicons-light-bulb" class="mr-2 text-yellow-500" />
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <div v-if="approvalResult.overallFeedback" class="feedback-section">
          <h4>总体反馈</h4>
          <p>{{ approvalResult.overallFeedback }}</p>
        </div>
      </div>

      <template #footer>
        <div class="result-actions">
          <UButton
            v-if="approvalResult.approved"
            @click="acceptResult"
            color="green"
            icon="i-heroicons-check"
          >
            接受并使用
          </UButton>
          <UButton
            v-else
            @click="reviseContent"
            color="amber"
            icon="i-heroicons-pencil"
          >
            返回修改
          </UButton>
          <UButton
            @click="requestReview"
            color="blue"
            variant="outline"
            icon="i-heroicons-user-plus"
          >
            请求人工审核
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useAiIntegration } from '~/composables/useAiIntegration'
import { useEntityStore } from '~/stores/entities'
import type { ApprovalRequest, ApprovalResponse, ApprovalIssue } from '~/types/ai'

defineOptions({
  name: 'ApprovalPanel'
})

const { approveContent: aiApproveContent, isProcessing } = useAiIntegration()
const entityStore = useEntityStore()

// 响应式数据
const contentToCheck = ref('')
const selectedChecks = ref<string[]>([
  'consistency',
  'logic',
  'continuity',
  'lore-adherence'
])
const approvalContext = ref({
  worldSetting: '',
  entities: [] as any[],
  relationships: [] as any[],
  previousContent: ''
})
const approvalResult = ref<ApprovalResponse | null>(null)
const isApproving = ref(false)
const contextTab = ref('world')

// 可用的检查项
const availableChecks = [
  {
    label: '一致性检查',
    value: 'consistency',
    description: '检查内容是否与之前的信息保持一致'
  },
  {
    label: '逻辑性检查',
    value: 'logic',
    description: '检查内容是否合乎逻辑和常理'
  },
  {
    label: '连续性检查',
    value: 'continuity',
    description: '检查内容是否与前文连贯'
  },
  {
    label: '设定遵循度检查',
    value: 'lore-adherence',
    description: '检查内容是否遵循世界观设定'
  }
]

// 方法
const approveContent = async () => {
  if (!contentToCheck.value) return

  isApproving.value = true

  try {
    const request: ApprovalRequest = {
      content: contentToCheck.value,
      context: {
        ...approvalContext.value,
        entities: approvalContext.value.entities,
        relationships: approvalContext.value.relationships
      },
      checks: selectedChecks.value as any
    }

    const result = await aiApproveContent(request)
    approvalResult.value = result
  } catch (error) {
    console.error('Approval failed:', error)
    // 显示错误消息
  } finally {
    isApproving.value = false
  }
}

const getResultColor = (result: ApprovalResponse) => {
  if (result.approved) return 'green'
  if (result.overallStatus === 'conditional') return 'amber'
  return 'red'
}

const getResultText = (result: ApprovalResponse) => {
  if (result.approved) return '通过审批'
  if (result.overallStatus === 'conditional') return '有条件通过'
  return '未通过审批'
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'green'
  if (confidence >= 0.6) return 'yellow'
  return 'red'
}

const getIssueSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'red'
    case 'high':
      return 'orange'
    case 'medium':
      return 'yellow'
    case 'low':
    default:
      return 'blue'
  }
}

const getIssueTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'continuity': '连续性问题',
    'consistency': '一致性问题',
    'logic': '逻辑问题',
    'lore': '设定问题',
    'character': '角色问题',
    'timeline': '时间线问题'
  }
  return typeMap[type] || type
}

const getIssueIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'continuity': 'i-heroicons-clock',
    'consistency': 'i-heroicons-shield-check',
    'logic': 'i-heroicons-calculator',
    'lore': 'i-heroicons-book-open',
    'character': 'i-heroicons-user',
    'timeline': 'i-heroicons-calendar-days'
  }
  return iconMap[type] || 'i-heroicons-exclamation-circle'
}

const acceptResult = () => {
  // 这里可以发出事件通知父组件接受审批结果
  emit('content-approved', approvalResult.value)
}

const reviseContent = () => {
  // 可能需要根据审批结果修改内容
  approvalResult.value = null
}

const requestReview = () => {
  // 发起人工审核请求
  alert('已提交人工审核请求')
}

const loadCharacters = async () => {
  try {
    // 加载实体存储中的角色
    approvalContext.value.entities = entityStore.getNodesByType('character')
  } catch (error) {
    console.error('Failed to load characters:', error)
  }
}

// 定义emit
const emit = defineEmits<{
  'content-approved': [result: ApprovalResponse]
}>()
</script>

<style scoped>
.approval-panel {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .panel-content {
    grid-template-columns: 1fr;
  }
}

.input-section, .checks-section, .context-section {
  margin-bottom: 1.5rem;
}

.content-input {
  min-height: 200px;
}

.checks-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.context-controls {
  margin-top: 1rem;
}

.context-content {
  min-height: 150px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-card {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  border-left-width: 4px;
  border-left-style: solid;
}

.issue-card.issue-low {
  border-left-color: #60a5fa; /* blue */
  background-color: #eff6ff;
}

.issue-card.issue-medium {
  border-left-color: #fbbf24; /* amber */
  background-color: #fef3c7;
}

.issue-card.issue-high {
  border-left-color: #f97316; /* orange */
  background-color: #ffedd5;
}

.issue-card.issue-critical {
  border-left-color: #ef4444; /* red */
  background-color: #fee2e2;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.issue-type {
  display: flex;
  align-items: center;
}

.issue-description {
  margin: 0;
}

.suggestions-list {
  list-style: none;
  padding: 0;
}

.suggestions-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.suggestions-list li:last-child {
  border-bottom: none;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
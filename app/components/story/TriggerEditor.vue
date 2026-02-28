<template>
  <div class="trigger-editor">
    <UCard>
      <template #header>
        <div class="header">
          <h2>触发器编辑器</h2>
          <UButton
            @click="addNewTrigger"
            icon="i-heroicons-plus-circle"
            color="primary"
          >
            新建触发器
          </UButton>
        </div>
      </template>

      <div class="triggers-list">
        <div
          v-for="trigger in triggers"
          :key="trigger.id"
          class="trigger-card"
          :class="{ 'active': trigger.status === 'active' }"
        >
          <div class="trigger-header">
            <h3>{{ trigger.name }}</h3>
            <div class="trigger-actions">
              <UTooltip text="编辑">
                <UButton
                  @click="editTrigger(trigger)"
                  icon="i-heroicons-pencil"
                  size="xs"
                  variant="ghost"
                />
              </UTooltip>
              <UTooltip text="删除">
                <UButton
                  @click="deleteTrigger(trigger.id)"
                  icon="i-heroicons-trash"
                  size="xs"
                  variant="ghost"
                  color="red"
                />
              </UTooltip>
              <UButton
                @click="toggleTriggerStatus(trigger)"
                :color="trigger.status === 'active' ? 'green' : 'neutral'"
                size="xs"
              >
                {{ trigger.status === 'active' ? '激活' : '停用' }}
              </UButton>
            </div>
          </div>
          <div class="trigger-info">
            <p class="description">{{ trigger.description }}</p>
            <div class="trigger-meta">
              <span class="priority">优先级: {{ trigger.priority }}</span>
              <span class="status" :class="trigger.status">{{ trigger.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 触发器编辑对话框 -->
    <UModal v-model="showEditModal" :overlay="true">
      <UCard>
        <template #header>
          <h3>{{ editingTrigger ? '编辑触发器' : '新建触发器' }}</h3>
        </template>

        <UForm :state="triggerForm" @submit="saveTrigger" class="trigger-form">
          <div class="form-row">
            <UFormGroup label="触发器名称" name="name" required class="mb-4 mr-2">
              <UInput v-model="triggerForm.name" placeholder="输入触发器名称" />
            </UFormGroup>

            <UFormGroup label="优先级" name="priority" class="mb-4">
              <URange
                v-model="triggerForm.priority"
                :min="1"
                :max="10"
                :step="1"
                size="sm"
              />
              <div class="range-value">{{ triggerForm.priority }}/10</div>
            </UFormGroup>
          </div>

          <UFormGroup label="描述" name="description" class="mb-4">
            <UTextarea
              v-model="triggerForm.description"
              placeholder="描述触发器的作用和触发条件..."
              rows="3"
            />
          </UFormGroup>

          <div class="condition-section">
            <h4>触发条件</h4>

            <UFormGroup label="条件类型" name="condition.type" class="mb-2">
              <USelect
                v-model="triggerForm.condition.type"
                :options="conditionTypes"
                placeholder="选择条件类型"
                @update:modelValue="onConditionTypeChange"
              />
            </UFormGroup>

            <div v-if="triggerForm.condition.type" class="condition-fields">
              <UFormGroup
                v-if="['time', 'attribute-threshold'].includes(triggerForm.condition.type)"
                label="操作符"
                name="condition.operator"
                class="mb-2"
              >
                <USelect
                  v-model="triggerForm.condition.operator"
                  :options="operators"
                  placeholder="选择操作符"
                />
              </UFormGroup>

              <UFormGroup label="属性/值" name="condition.value" class="mb-2">
                <UInput
                  v-if="triggerForm.condition.type === 'attribute-threshold'"
                  v-model="triggerForm.condition.value"
                  placeholder="输入阈值"
                  type="number"
                />
                <UInput
                  v-else-if="triggerForm.condition.type === 'location'"
                  v-model="triggerForm.condition.value"
                  placeholder="输入地点名称"
                />
                <UInput
                  v-else-if="triggerForm.condition.type === 'character-presence'"
                  v-model="triggerForm.condition.value"
                  placeholder="输入角色ID或名称"
                />
                <UDatepicker
                  v-else-if="triggerForm.condition.type === 'time'"
                  v-model="triggerForm.condition.timeReference"
                  menu-container=".trigger-form"
                />
                <UInput
                  v-else
                  v-model="triggerForm.condition.value"
                  placeholder="输入值"
                />
              </UFormGroup>

              <UFormGroup
                v-if="['attribute-threshold', 'relationship-status', 'plot-event-status'].includes(triggerForm.condition.type)"
                label="实体ID"
                name="condition.entityId"
                class="mb-2"
              >
                <UInput
                  v-model="triggerForm.condition.entityId"
                  placeholder="关联的实体ID（可选）"
                />
              </UFormGroup>

              <UFormGroup
                v-if="triggerForm.condition.type === 'relationship-status'"
                label="关系详情"
                name="condition.value"
                class="mb-2"
              >
                <div class="relation-fields">
                  <UInput
                    v-model="triggerForm.condition.value.source"
                    placeholder="源实体ID"
                    class="mb-2"
                  />
                  <UInput
                    v-model="triggerForm.condition.value.target"
                    placeholder="目标实体ID"
                    class="mb-2"
                  />
                  <UInput
                    v-model="triggerForm.condition.value.relationType"
                    placeholder="关系类型"
                  />
                </div>
              </UFormGroup>

              <UFormGroup
                v-if="triggerForm.condition.type === 'plot-event-status'"
                label="事件详情"
                name="condition.value"
                class="mb-2"
              >
                <div class="event-fields">
                  <UInput
                    v-model="triggerForm.condition.value.eventId"
                    placeholder="剧情事件ID"
                    class="mb-2"
                  />
                  <USelect
                    v-model="triggerForm.condition.value.expectedStatus"
                    :options="eventStatusOptions"
                    placeholder="期望的状态"
                  />
                </div>
              </UFormGroup>
            </div>
          </div>

          <div class="action-section">
            <h4>触发动作</h4>

            <UFormGroup label="动作类型" name="action.type" class="mb-2">
              <USelect
                v-model="triggerForm.action.type"
                :options="actionTypes"
                placeholder="选择动作类型"
              />
            </UFormGroup>

            <UFormGroup label="目标" name="action.target" class="mb-2">
              <UInput
                v-model="triggerForm.action.target"
                placeholder="目标ID或标识符"
              />
            </UFormGroup>

            <UFormGroup label="参数" name="action.parameters" class="mb-2">
              <UTextarea
                v-model="triggerForm.action.parametersStr"
                placeholder='输入参数（JSON格式），例如：{"attribute": "power", "delta": 10}'
                rows="3"
              />
            </UFormGroup>
          </div>

          <template #footer>
            <div class="flex justify-end space-x-3">
              <UButton type="button" color="neutral" variant="outline" @click="showEditModal = false">
                取消
              </UButton>
              <UButton type="submit" color="primary">
                {{ editingTrigger ? '更新触发器' : '创建触发器' }}
              </UButton>
            </div>
          </template>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useTriggerStore } from '~/stores/triggers'
import type { Trigger, TriggerCondition, TriggerAction } from '~/types/story'

defineOptions({
  name: 'TriggerEditor'
})

const triggerStore = useTriggerStore()

// 响应式数据
const triggers = computed(() => triggerStore.getAllTriggers)
const showEditModal = ref(false)
const editingTrigger = ref<Trigger | null>(null)
const triggerForm = ref({
  id: '',
  name: '',
  description: '',
  condition: {
    type: '',
    operator: '',
    property: '',
    value: '',
    entityId: '',
    timeReference: null as Date | null
  } as any as TriggerCondition,
  action: {
    type: '',
    target: '',
    parameters: {},
    parametersStr: '{}',
    effects: []
  } as any as TriggerAction,
  status: 'inactive' as const,
  priority: 5,
  createdAt: new Date(),
  updatedAt: new Date()
})

// 选项
const conditionTypes = [
  { label: '时间', value: 'time' },
  { label: '地点', value: 'location' },
  { label: '角色在场', value: 'character-presence' },
  { label: '属性阈值', value: 'attribute-threshold' },
  { label: '关系状态', value: 'relationship-status' },
  { label: '剧情事件状态', value: 'plot-event-status' }
]

const operators = [
  { label: '等于', value: 'equals' },
  { label: '大于', value: 'greater-than' },
  { label: '小于', value: 'less-than' },
  { label: '包含', value: 'contains' },
  { label: '匹配', value: 'matches' },
  { label: '早于', value: 'before' },
  { label: '晚于', value: 'after' }
]

const actionTypes = [
  { label: '激活剧情事件', value: 'activate-plot-event' },
  { label: '修改实体属性', value: 'modify-entity-attribute' },
  { label: '创建关系', value: 'create-relationship' },
  { label: '更改位置', value: 'change-location' },
  { label: '执行脚本', value: 'execute-script' }
]

const eventStatusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '活跃', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: '已跳过', value: 'skipped' }
]

// 方法
const addNewTrigger = () => {
  triggerForm.value = {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    condition: {
      type: '',
      operator: '',
      property: '',
      value: '',
      entityId: '',
      timeReference: null
    },
    action: {
      type: '',
      target: '',
      parameters: {},
      parametersStr: '{}',
      effects: []
    },
    status: 'inactive',
    priority: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  editingTrigger.value = null
  showEditModal.value = true
}

const editTrigger = (trigger: Trigger) => {
  triggerForm.value = JSON.parse(JSON.stringify(trigger))
  // 将parameters对象转换为JSON字符串
  triggerForm.value.action.parametersStr = JSON.stringify(triggerForm.value.action.parameters, null, 2)
  editingTrigger.value = trigger
  showEditModal.value = true
}

const deleteTrigger = async (id: string) => {
  if (confirm('确定要删除这个触发器吗？此操作不可撤销。')) {
    await triggerStore.removeTrigger(id)
  }
}

const toggleTriggerStatus = async (trigger: Trigger) => {
  const newStatus = trigger.status === 'active' ? 'inactive' : 'active'
  await triggerStore.setTriggerStatus(trigger.id, newStatus)
}

const onConditionTypeChange = () => {
  // 重置相关的条件字段
  triggerForm.value.condition.property = ''
  triggerForm.value.condition.value = ''
  triggerForm.value.condition.operator = ''

  if (triggerForm.value.condition.type === 'relationship-status') {
    triggerForm.value.condition.value = {
      source: '',
      target: '',
      relationType: ''
    }
  } else if (triggerForm.value.condition.type === 'plot-event-status') {
    triggerForm.value.condition.value = {
      eventId: '',
      expectedStatus: ''
    }
  }
}

const saveTrigger = async () => {
  try {
    // 解析参数字符串为对象
    if (triggerForm.value.action.parametersStr) {
      triggerForm.value.action.parameters = JSON.parse(triggerForm.value.action.parametersStr)
    } else {
      triggerForm.value.action.parameters = {}
    }

    if (editingTrigger.value) {
      // 更新现有触发器
      await triggerStore.updateTrigger(editingTrigger.value.id, triggerForm.value)
    } else {
      // 创建新触发器
      await triggerStore.addTrigger(triggerForm.value)
    }

    showEditModal.value = false
    editingTrigger.value = null
  } catch (error) {
    console.error('Failed to save trigger:', error)
    // 显示错误消息
  }
}

// 初始化
onMounted(async () => {
  await triggerStore.loadTriggerData()
})
</script>

<style scoped>
.trigger-editor {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.triggers-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.trigger-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  transition: all 0.2s;
}

.trigger-card.active {
  border-color: #22c55e;
  background-color: #ecfdf5;
}

.trigger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.trigger-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.trigger-actions {
  display: flex;
  gap: 0.25rem;
}

.description {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.trigger-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
}

.status {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.status.active {
  background-color: #dcfce7;
  color: #16a34a;
}

.status.inactive {
  background-color: #e5e7eb;
  color: #6b7280;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.range-value {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.condition-section, .action-section {
  padding: 1rem;
  margin: 1rem 0;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}

.condition-section h4, .action-section h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #374151;
}

.condition-fields {
  padding: 0.75rem;
  background-color: #fff;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
}

.relation-fields, .event-fields {
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
}
</style>
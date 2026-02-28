<template>
  <div class="character-editor">
    <UCard>
      <template #header>
        <div class="header">
          <h2>角色编辑器</h2>
          <UButton
            @click="generateCharacter"
            :loading="isGenerating"
            icon="i-heroicons-sparkles"
            color="primary"
          >
            AI生成角色
          </UButton>
        </div>
      </template>

      <div class="form-grid">
        <div class="form-section">
          <h3>基本信息</h3>

          <UFormGroup label="角色ID" name="id" class="mb-4">
            <UInput v-model="characterForm.id" placeholder="系统自动生成或手动输入" readonly />
          </UFormGroup>

          <UFormGroup label="姓名" name="name" class="mb-4">
            <UInput v-model="characterForm.properties.name" placeholder="输入角色姓名" />
          </UFormGroup>

          <UFormGroup label="角色类型" name="type" class="mb-4">
            <USelect
              v-model="characterForm.type"
              :options="characterTypes"
              placeholder="选择角色类型"
            />
          </UFormGroup>

          <UFormGroup label="角色定位" name="role" class="mb-4">
            <USelect
              v-model="characterForm.properties.role"
              :options="roleTypes"
              placeholder="选择角色定位"
            />
          </UFormGroup>

          <UFormGroup label="性别" name="gender" class="mb-4">
            <USelect
              v-model="characterForm.properties.gender"
              :options="genders"
              placeholder="选择性别"
            />
          </UFormGroup>

          <UFormGroup label="年龄" name="age" class="mb-4">
            <UInput
              v-model.number="characterForm.properties.age"
              type="number"
              placeholder="输入年龄"
            />
          </UFormGroup>
        </div>

        <div class="form-section">
          <h3>属性设置</h3>

          <UFormGroup label="战力等级" name="powerLevel" class="mb-4">
            <URange
              v-model="characterForm.properties.powerLevel"
              :min="0"
              :max="100"
              :step="1"
              size="sm"
            />
            <div class="range-value">{{ characterForm.properties.powerLevel }}/100</div>
          </UFormGroup>

          <UFormGroup label="状态" name="status" class="mb-4">
            <USelect
              v-model="characterForm.properties.status"
              :options="statusOptions"
              placeholder="选择角色状态"
            />
          </UFormGroup>

          <UFormGroup label="个性特点" name="personality" class="mb-4">
            <UTextarea
              v-model="characterForm.properties.personality"
              placeholder="描述角色的个性特点..."
              rows="3"
            />
          </UFormGroup>

          <UFormGroup label="能力" name="abilities" class="mb-4">
            <UTag
              v-for="(ability, index) in characterForm.properties.abilities"
              :key="index"
              :value="ability"
              removable
              @remove="removeAbility(index)"
              class="mr-2 mb-2"
            />
            <div class="ability-input">
              <UInput
                v-model="newAbility"
                placeholder="输入能力名称"
                @keypress.enter="addAbility"
                class="mr-2"
              />
              <UButton @click="addAbility" icon="i-heroicons-plus" size="xs" />
            </div>
          </UFormGroup>

          <UFormGroup label="背景故事" name="background" class="mb-4">
            <UTextarea
              v-model="characterForm.properties.background"
              placeholder="描述角色的背景故事..."
              rows="4"
            />
          </UFormGroup>
        </div>
      </div>

      <template #footer>
        <div class="footer-actions">
          <UButton @click="resetForm" color="neutral" variant="outline">
            重置
          </UButton>
          <div class="flex gap-2">
            <UButton @click="cancelEdit" color="neutral" variant="outline">
              取消
            </UButton>
            <UButton @click="saveCharacter" color="primary">
              {{ editingCharacter ? '更新角色' : '创建角色' }}
            </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <!-- 角色列表 -->
    <UCard class="mt-6">
      <template #header>
        <h3>角色列表</h3>
      </template>

      <div class="character-list">
        <div
          v-for="char in characters"
          :key="char.id"
          class="character-item"
          :class="{ 'selected': selectedCharacter?.id === char.id }"
          @click="selectCharacter(char)"
        >
          <div class="character-info">
            <h4>{{ char.properties.name || '未命名角色' }}</h4>
            <p>{{ char.properties.role || '未知定位' }} • {{ char.properties.gender || '未知性别' }}</p>
          </div>
          <div class="character-stats">
            <span class="power-badge">战力: {{ char.properties.powerLevel || 0 }}</span>
            <UButton
              @click.stop="editCharacter(char)"
              icon="i-heroicons-pencil"
              size="xs"
              variant="ghost"
            />
            <UButton
              @click.stop="deleteCharacter(char.id)"
              icon="i-heroicons-trash"
              size="xs"
              variant="ghost"
              color="red"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- AI生成对话框 -->
    <UModal v-model="showGenerateModal">
      <UCard>
        <template #header>
          <h3>AI生成角色</h3>
        </template>

        <UForm :state="generationForm" @submit="submitGeneration" class="space-y-4">
          <UFormGroup label="角色概念" name="concept" required>
            <UTextarea
              v-model="generationForm.concept"
              placeholder="描述您想要的角色概念，如：'正义的年轻剑客，性格坚毅，身世神秘'"
              rows="3"
            />
          </UFormGroup>

          <UFormGroup label="角色类型" name="roleType">
            <USelect
              v-model="generationForm.roleType"
              :options="roleTypeOptions"
              placeholder="选择角色类型"
            />
          </UFormGroup>

          <UFormGroup label="与主角关系" name="relationship">
            <UInput
              v-model="generationForm.relationshipToProtagonist"
              placeholder="描述与主角的关系"
            />
          </UFormGroup>

          <template #footer>
            <div class="flex justify-end space-x-3">
              <UButton type="button" color="neutral" @click="showGenerateModal = false">
                取消
              </UButton>
              <UButton type="submit" color="primary" :loading="isGenerating">
                生成角色
              </UButton>
            </div>
          </template>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useEntityStore } from '~/stores/entities'
import { useAiIntegration } from '~/composables/useAiIntegration'
import type { EntityNode } from '~/types/entity'

defineOptions({
  name: 'CharacterEditor'
})

const entityStore = useEntityStore()
const { generateCharacter: aiGenerateCharacter, isProcessing } = useAiIntegration()

// 响应式数据
const characterForm = ref({
  id: '',
  type: 'character' as const,
  label: '',
  properties: {
    name: '',
    age: undefined as number | undefined,
    gender: '',
    role: '',
    personality: '',
    abilities: [] as string[],
    relationships: [] as string[],
    powerLevel: 50,
    status: 'alive' as const,
    background: '',
    motivations: '',
    flaws: ''
  },
  position: { x: 0, y: 0 },
  category: 'character',
  createdAt: new Date(),
  updatedAt: new Date()
})

const newAbility = ref('')
const isGenerating = ref(false)
const showGenerateModal = ref(false)
const editingCharacter = ref<EntityNode | null>(null)
const selectedCharacter = ref<EntityNode | null>(null)

// 生成表单
const generationForm = ref({
  concept: '',
  roleType: undefined as 'protagonist' | 'antagonist' | 'supporting' | 'neutral' | undefined,
  relationshipToProtagonist: ''
})

// 计算属性
const characters = computed(() => {
  return entityStore.getNodesByType('character')
})

const characterTypes = [
  { label: '角色', value: 'character' },
  { label: '地点', value: 'location' },
  { label: '物品', value: 'item' },
  { label: '组织', value: 'organization' },
  { label: '事件', value: 'event' }
]

const roleTypes = [
  { label: '主角', value: 'protagonist' },
  { label: '反派', value: 'antagonist' },
  { label: '配角', value: 'supporting' },
  { label: '路人', value: 'background' },
  { label: '导师', value: 'mentor' },
  { label: '对手', value: 'rival' }
]

const genders = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' },
  { label: '不愿透露', value: 'prefer-not-to-say' }
]

const statusOptions = [
  { label: '存活', value: 'alive' },
  { label: '死亡', value: 'dead' },
  { label: '未知', value: 'unknown' }
]

const roleTypeOptions = [
  { label: '主角', value: 'protagonist' },
  { label: '反派', value: 'antagonist' },
  { label: '配角', value: 'supporting' },
  { label: '中立', value: 'neutral' }
]

// 方法
const addAbility = () => {
  if (newAbility.value.trim() && !characterForm.value.properties.abilities.includes(newAbility.value.trim())) {
    characterForm.value.properties.abilities.push(newAbility.value.trim())
    newAbility.value = ''
  }
}

const removeAbility = (index: number) => {
  characterForm.value.properties.abilities.splice(index, 1)
}

const resetForm = () => {
  characterForm.value = {
    id: crypto.randomUUID(),
    type: 'character',
    label: '',
    properties: {
      name: '',
      age: undefined,
      gender: '',
      role: '',
      personality: '',
      abilities: [],
      relationships: [],
      powerLevel: 50,
      status: 'alive',
      background: '',
      motivations: '',
      flaws: ''
    },
    position: { x: 0, y: 0 },
    category: 'character',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  editingCharacter.value = null
}

const selectCharacter = (character: EntityNode) => {
  selectedCharacter.value = character
}

const editCharacter = (character: EntityNode) => {
  characterForm.value = JSON.parse(JSON.stringify(character))
  editingCharacter.value = character
  selectedCharacter.value = character
}

const saveCharacter = async () => {
  try {
    // 更新标签为角色姓名
    characterForm.value.label = characterForm.value.properties.name || '未命名角色'

    if (editingCharacter.value) {
      // 更新现有角色
      await entityStore.updateNode(characterForm.value.id, characterForm.value)
    } else {
      // 创建新角色
      characterForm.value.id = crypto.randomUUID()
      await entityStore.addNode(characterForm.value)
    }

    resetForm()
    // 显示成功消息
  } catch (error) {
    console.error('Failed to save character:', error)
    // 显示错误消息
  }
}

const deleteCharacter = async (id: string) => {
  if (confirm('确定要删除这个角色吗？此操作不可撤销。')) {
    try {
      await entityStore.removeNode(id)
      if (selectedCharacter.value?.id === id) {
        selectedCharacter.value = null
      }
      if (editingCharacter.value?.id === id) {
        editingCharacter.value = null
        resetForm()
      }
    } catch (error) {
      console.error('Failed to delete character:', error)
      // 显示错误消息
    }
  }
}

const cancelEdit = () => {
  if (editingCharacter.value) {
    resetForm()
  } else {
    // 只是取消当前表单填写
    resetForm()
  }
}

const generateCharacter = () => {
  showGenerateModal.value = true
}

const submitGeneration = async () => {
  isGenerating.value = true

  try {
    const aiRequest = {
      concept: generationForm.value.concept,
      roleType: generationForm.value.roleType,
      relationshipToProtagonist: generationForm.value.relationshipToProtagonist,
      worldContext: {}, // 当前世界观上下文
      customAttributes: [] // 自定义属性
    }

    const generatedCharacter = await aiGenerateCharacter(aiRequest)

    // 设置为当前表单内容
    characterForm.value = generatedCharacter
    editingCharacter.value = null

    // 关闭对话框
    showGenerateModal.value = false
  } catch (error) {
    console.error('Failed to generate character:', error)
    // 显示错误消息
  } finally {
    isGenerating.value = false
  }
}

// 初始化
onMounted(() => {
  resetForm()
})
</script>

<style scoped>
.character-editor {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-section h3 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

.range-value {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.ability-input {
  display: flex;
  align-items: center;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
}

.character-list {
  max-height: 400px;
  overflow-y: auto;
}

.character-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.character-item:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.character-item.selected {
  background-color: #dbeafe;
  border-color: #3b82f6;
}

.character-info h4 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.character-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.character-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.power-badge {
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
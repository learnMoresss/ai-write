<template>
  <UModal
    :ui="{ width: 'w-full max-w-md' }"
    :open="isOpen"
    @close="closeModal"
  >
    <UCard>
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ currentView === 'login' ? '登录账号' : '创建账户' }}
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            {{ currentView === 'login' ? '欢迎回来，请登录您的账号' : '创建新账户开始创作' }}
          </p>
        </div>
      </template>

      <!-- Tab 切换 -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          type="button"
          class="flex-1 py-3 px-4 text-center font-medium text-sm relative"
          :class="[
            currentView === 'login'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
          ]"
          @click="currentView = 'login'"
        >
          <span>登录</span>
          <span
            v-if="currentView === 'login'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 dark:bg-primary-400"
          ></span>
        </button>
        <button
          type="button"
          class="flex-1 py-3 px-4 text-center font-medium text-sm relative"
          :class="[
            currentView === 'register'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
          ]"
          @click="currentView = 'register'"
        >
          <span>注册</span>
          <span
            v-if="currentView === 'register'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 dark:bg-primary-400"
          ></span>
        </button>
      </div>

      <!-- 错误消息 -->
      <URenderIf condition="error">
        <UAlert
          :description="error"
          color="red"
          variant="subtle"
          icon="i-heroicons-exclamation-circle"
          class="mb-6"
        />
      </URenderIf>

      <!-- 表单 -->
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- 注册时的姓名字段 -->
          <UFormGroup
            v-if="currentView === 'register'"
            label="姓名"
            name="name"
            :required="false"
            class="mb-4"
          >
            <UInput
              v-model="form.name"
              placeholder="请输入您的姓名"
              autocomplete="name"
            />
          </UFormGroup>

          <UFormGroup
            label="邮箱"
            name="email"
            required
            :error="errors.email"
            class="mb-4"
          >
            <UInput
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱地址"
              :disabled="loading"
              autocomplete="email"
            />
          </UFormGroup>

          <UFormGroup
            label="密码"
            name="password"
            required
            :error="errors.password"
            class="mb-4"
          >
            <UInput
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :disabled="loading"
              autocomplete="current-password"
            />
          </UFormGroup>

          <!-- 注册确认密码字段 -->
          <UFormGroup
            v-if="currentView === 'register'"
            label="确认密码"
            name="confirmPassword"
            required
            :error="errors.confirmPassword"
            class="mb-4"
          >
            <UInput
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :disabled="loading"
              autocomplete="new-password"
            />
          </UFormGroup>

          <!-- 登录时的记住我选项 -->
          <div v-if="currentView === 'login'" class="flex items-center justify-between">
            <UCheckbox
              v-model="rememberMe"
              label="记住我"
              :disabled="loading"
            />
            <UButton
              type="button"
              color="primary"
              variant="link"
              size="sm"
              :disabled="loading"
              @click="handleForgotPassword"
            >
              忘记密码?
            </UButton>
          </div>
        </div>

        <UButton
          type="submit"
          :loading="loading"
          :disabled="!isFormValid"
          color="primary"
          class="w-full mt-8"
          size="lg"
        >
          {{ loading ? '处理中...' : (currentView === 'login' ? '登录' : '注册') }}
        </UButton>
      </form>

      <template #footer>
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          {{ currentView === 'login' ? '还没有账户?' : '已有账户?' }}
          <UButton
            type="button"
            color="primary"
            variant="link"
            size="sm"
            :disabled="loading"
            @click="currentView = currentView === 'login' ? 'register' : 'login'"
          >
            {{ currentView === 'login' ? '立即注册' : '立即登录' }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
interface FormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const isOpen = defineModel<boolean>('open', { required: true })

// 事件发射器
const emit = defineEmits<{
  close: []
}>()

// 表单状态
const currentView = ref<'login' | 'register'>('login')
const form = ref<FormData>({
  name: undefined,
  email: '',
  password: '',
  confirmPassword: undefined
})
const errors = ref<FormErrors>({})
const loading = ref(false)
const rememberMe = ref(true)

// 计算属性
const isFormValid = computed(() => {
  if (!form.value.email || !form.value.password) {
    return false
  }

  if (currentView.value === 'register') {
    if (!form.value.confirmPassword || form.value.password !== form.value.confirmPassword) {
      return false
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email)) {
      return false
    }
  }

  return true
})

// 错误消息
const error = computed(() => {
  // 如果有表单验证错误，则返回第一个错误
  const firstError = Object.values(errors.value).find(error => error)
  return firstError
})

// 方法
const validateForm = (): boolean => {
  const newErrors: FormErrors = {}

  // 邮箱验证
  if (!form.value.email) {
    newErrors.email = '请输入邮箱地址'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
  }

  // 密码验证
  if (!form.value.password) {
    newErrors.password = '请输入密码'
  } else if (form.value.password.length < 6) {
    newErrors.password = '密码长度至少为6位'
  }

  // 确认密码验证（仅注册时）
  if (currentView.value === 'register') {
    if (!form.value.confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (form.value.password !== form.value.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const { login, register } = useAuth()

    let result
    if (currentView.value === 'login') {
      result = await login(form.value.email, form.value.password)
    } else {
      result = await register(form.value.email, form.value.password, form.value.name)
    }

    if (result.success) {
      // 登录/注册成功
      resetForm()
      closeModal()
    } else {
      // 处理错误
      errors.value = { ...errors.value, email: result.error || '操作失败，请重试' }
    }
  } catch (err: any) {
    console.error(`${currentView.value} error:`, err)
    errors.value = { ...errors.value, email: err.message || '发生未知错误' }
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  // 这里可以添加忘记密码逻辑
  alert('忘记密码功能即将推出')
}

const resetForm = () => {
  form.value = {
    name: undefined,
    email: '',
    password: '',
    confirmPassword: undefined
  }
  errors.value = {}
  currentView.value = 'login'
}

const closeModal = () => {
  resetForm()
  emit('close')
}
</script>
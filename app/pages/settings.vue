<script setup lang="ts">
import { apiGet, apiPut, apiPost } from '~/composables/useApi'

type Settings = {
  provider: string
  model: string
  apiKeyMasked: string
  theme: 'light' | 'dark'
}

const settings = reactive<Settings>({
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKeyMasked: '',
  theme: 'light'
})

const loading = ref(false)
const testLoading = ref(false)
const showApiKey = ref(false)
const apiKeyInput = ref('') // 临时存储未加密的API密钥

const toast = useToast()

const save = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('fake_token') || 'dev-token'

    // 只发送实际更改的值
    const settingsToSend: Partial<Settings> = {}

    // 比较并添加改变的字段
    if (settings.provider !== 'openai') { // 默认值
      settingsToSend.provider = settings.provider
    }
    if (settings.model !== 'gpt-4o-mini') { // 默认值
      settingsToSend.model = settings.model
    }
    if (settings.theme !== 'light') { // 默认值
      settingsToSend.theme = settings.theme
    }

    // 如果用户输入了新的API密钥，则发送；否则不发送（保留原有密钥）
    if (apiKeyInput.value.trim() !== '') {
      settingsToSend.apiKeyMasked = apiKeyInput.value
    }

    await apiPut<Settings>('/api/settings', settingsToSend, { 'x-fake-token': token })

    // 更新主题
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(settings.theme)

    // 成功提示
    toast.add({
      title: '设置保存成功',
      description: '您的系统设置已成功保存',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  } catch (error: unknown) {
    toast.add({
      title: '保存失败',
      description: error instanceof Error ? error.message : '保存设置时发生错误',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    loading.value = false
  }
}

// 测试AI连接功能
const testAiConnection = async () => {
  if (!apiKeyInput.value.trim()) {
    toast.add({
      title: '请输入API密钥',
      description: '请先输入API密钥后再测试连接',
      color: 'warning',
      icon: 'i-lucide-alert-triangle'
    })
    return
  }

  testLoading.value = true
  try {
    // 直接在客户端发起一个测试请求到我们自己的后端端点
    // 后端将使用传入的凭证来测试AI服务的连接性
    const token = localStorage.getItem('fake_token') || 'dev-token'

    const data = await apiPost<{ success: boolean; message?: string }>('/api/test-connection', {
      provider: settings.provider,
      model: settings.model,
      apiKey: apiKeyInput.value
    }, { 'x-fake-token': token, 'Content-Type': 'application/json' })

    if (data.success) {
      toast.add({
        title: '连接测试成功',
        description: data.message || 'AI服务连接正常，可以正常使用',
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    } else {
      toast.add({
        title: '连接测试失败',
        description: data.message || 'AI服务连接失败',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    }
  } catch (error: unknown) {
    toast.add({
      title: '连接测试失败',
      description: error instanceof Error ? error.message : 'AI服务连接失败，请检查配置',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    testLoading.value = false
  }
}

onMounted(async () => {
  const data = await apiGet<Settings & { apiKeyMasked?: string }>('/api/settings')
  Object.assign(settings, data)

  if (data.apiKeyMasked) {
    toast.add({
      title: '检测到已保存的API密钥',
      description: '系统中已有API密钥，如需更换请在下方输入新密钥',
      color: 'info',
      icon: 'i-lucide-info'
    })
  }

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(data.theme)
})

useSeoMeta({ title: '作家工坊 | 设置' })
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-amber-50 to-stone-100 dark:from-slate-900 dark:to-slate-800">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8 px-4 sm:px-6 lg:px-8 pt-8">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">系统设置</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">
          个性化您的创作环境，调整系统偏好设置
        </p>
      </header>

      <div class="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <form class="space-y-8" @submit.prevent="save">
          <!-- AI 服务设置 -->
          <section class="space-y-5">
            <div class="border-b border-slate-200/60 dark:border-slate-700/60 pb-5">
              <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span class="i-lucide-bot text-lg text-teal-600 dark:text-teal-400"></span>
                AI 服务设置
              </h2>
              <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">
                配置您的AI服务提供商和模型偏好
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">AI 服务商</label>
                <select
                  v-model="settings.provider"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="nvidia">NVIDIA</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">模型</label>
                <input
                  v-model="settings.model"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="如：gpt-4o-mini"
                />
              </div>

              <div class="space-y-2 md:col-span-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">API 密钥</label>
                <div class="relative">
                  <input
                    v-model="apiKeyInput"
                    :type="showApiKey ? 'text' : 'password'"
                    class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all pr-12"
                    placeholder="请输入您的API密钥"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    @click="showApiKey = !showApiKey"
                  >
                    <span :class="showApiKey ? 'i-lucide-eye text-sm' : 'i-lucide-eye-off text-sm'"></span>
                  </button>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  我们会在浏览器本地存储您的密钥，不会上传到任何服务器
                </p>
              </div>
            </div>

            <!-- 测试连接按钮 -->
            <div class="pt-2">
              <UButton
                :disabled="testLoading || !apiKeyInput.trim()"
                color="secondary"
                variant="outline"
                @click="testAiConnection"
                class="flex items-center gap-2"
              >
                <span v-if="testLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  测试中...
                </span>
                <span v-else>
                  <span class="i-lucide-wifi text-sm"></span>
                  <span>测试连接</span>
                </span>
              </UButton>
            </div>
          </section>

          <!-- 界面设置 -->
          <section class="space-y-5">
            <div class="border-b border-slate-200/60 dark:border-slate-700/60 pb-5">
              <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span class="i-lucide-palette text-lg text-teal-600 dark:text-teal-400"></span>
                界面设置
              </h2>
              <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">
                自定义您的视觉体验和界面偏好
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">主题模式</label>
                <div class="flex gap-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      v-model="settings.theme"
                      value="light"
                      class="h-4 w-4 text-teal-600 focus:ring-teal-500"
                    />
                    <span class="text-sm text-slate-700 dark:text-slate-300">明亮模式</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      v-model="settings.theme"
                      value="dark"
                      class="h-4 w-4 text-teal-600 focus:ring-teal-500"
                    />
                    <span class="text-sm text-slate-700 dark:text-slate-300">暗黑模式</span>
                  </label>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 block">字体大小</label>
                <select
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="small">小</option>
                  <option value="medium" selected>中</option>
                  <option value="large">大</option>
                </select>
              </div>
            </div>
          </section>

          <!-- 按钮区域 -->
          <div class="pt-6">
            <UButton
              :disabled="loading"
              color="primary"
              variant="solid"
              type="submit"
              class="flex items-center gap-2"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                保存中...
              </span>
              <span v-else>
                <span class="i-lucide-save text-sm"></span>
                <span>保存设置</span>
              </span>
            </UButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

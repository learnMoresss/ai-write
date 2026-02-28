<script setup>
// 引入认证相关
import { useAuthStore } from '~/stores/auth'

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'AI 小说创作平台'
const description = '利用人工智能技术辅助创作逻辑严密的长篇小说'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})

// 认证状态
const authStore = useAuthStore()
const showLoginModal = ref(false)

// 检查当前会话状态
onMounted(async () => {
  await authStore.refreshSession()
})

// 监听认证状态变化
let unsubscribeAuth = $ref(null)
onMounted(() => {
  const { listenAuthState } = useAuth()
  unsubscribeAuth = listenAuthState()
})

onUnmounted(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth()
  }
})

// 处理用户菜单项点击
const handleProfileClick = () => {
  // 处理个人资料导航
  console.log('Navigate to profile')
}

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>

        <TemplateMenu />
      </template>

      <template #right>
        <UColorModeButton />

        <!-- 认证状态相关按钮 -->
        <div v-if="authStore.isLoggedIn" class="flex items-center space-x-2">
          <UDropdown
            :items="[[{ label: `${authStore.currentUser?.name || authStore.currentUser?.email}`, disabled: true }], [{ label: '个人资料', slot: 'profile' }, { label: '退出登录', slot: 'logout' }]]"
            :popper="{ placement: 'bottom-end' }"
          >
            <UAvatar
              :src="authStore.currentUser?.avatar"
              :alt="authStore.currentUser?.name || authStore.currentUser?.email"
              size="xs"
            />

            <template #profile>
              <UIcon name="i-heroicons-user-circle" class="w-4 h-4" />
              <span>个人资料</span>
            </template>

            <template #logout>
              <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-4 h-4" />
              <span>退出登录</span>
            </template>
          </UDropdown>
        </div>

        <UButton
          v-else
          @click="showLoginModal = true"
          color="primary"
          variant="solid"
          size="sm"
        >
          登录
        </UButton>

        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <!-- 登录模态框 -->
    <LoginModal v-model:open="showLoginModal" @close="showLoginModal = false" />

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>

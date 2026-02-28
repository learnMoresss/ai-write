// plugins/auth.ts
// 初始化认证状态

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  // 在客户端挂载时检查认证状态
  if (process.client) {
    await authStore.refreshSession()

    // 监听认证状态变化
    const { listenAuthState } = useAuth()
    const unsubscribe = listenAuthState()

    // 在应用卸载时取消监听
    onNuxtReady(() => {
      try {
        if (unsubscribe) {
          // 可能需要将unsubscribe注册到适当的清理机制中
        }
      } catch (error) {
        console.error('Error unsubscribing from auth state:', error)
      }
    })
  }
})
// app/plugins/pinia.client.ts
import { setActivePinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const pinia = nuxtApp.$pinia

    if (pinia) {
      // 在客户端挂载时设置active pinia
      nuxtApp.hook('app:mounted', () => {
        setActivePinia(pinia)
      })

      // 在页面切换时也确保pinia被激活
      nuxtApp.hook('page:finish', () => {
        setActivePinia(pinia)
      })
    }

    // 添加钩子来处理服务端渲染后的情况
    nuxtApp.hook('app:rendered', () => {
      if (nuxtApp.payload && nuxtApp.$pinia) {
        try {
          const rawState = toRaw(nuxtApp.$pinia.state.value)
          nuxtApp.payload.pinia = rawState
          // 不在服务端渲染后设置setActivePinia(undefined)，因为这是在客户端执行的
        } catch (error) {
          console.warn('Could not serialize Pinia state:', error)
        }
      }
    })
  }

  return {
    provide: {}
  }
})
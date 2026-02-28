// server/middleware/01.server-config.ts
export default defineEventHandler((event) => {
  // 确保服务器配置正确应用
  if (process.env.NUXT_PORT) {
    event.context.env = event.context.env || {}
    event.context.env.PORT = process.env.NUXT_PORT
  }
})
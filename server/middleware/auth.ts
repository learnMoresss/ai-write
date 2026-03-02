import { readJson, settingsPath, defaultSettings } from '../lib/storage'

export default defineEventHandler(async (event) => {
  const pathname = event.node.req.url || ''

  // 白名单路径，无需验证
  const publicRoutes = ['/api/settings', '/api/books', '/api/test-connection']

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // 对于公共路由，我们允许请求继续，但验证是否已配置API Key（对于需要AI功能的请求）
    if (pathname.includes('/generate') || pathname.includes('/outline/plan') || pathname.includes('/expand-lore') || pathname.includes('/reflex-chapter')) {
      const settings = await readJson(settingsPath, defaultSettings())
      if (!settings.apiKeyMasked || settings.apiKeyMasked.trim() === '') {
        throw createError({
          statusCode: 401,
          statusMessage: 'API Key未配置，请先在设置页面填写API Key'
        })
      }
    }
    return // 公共路由，无需token验证
  }

  // 需要token验证的路由
  const token = getHeader(event, 'x-fake-token')

  // 检查请求方法，GET请求可能不需要token（用于获取数据）
  if (event.node.req.method === 'GET') {
    return // GET请求无需token验证
  }

  // 其他需要认证的请求需要有效的token
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing token'
    })
  }

  // 为演示目的，我们接受dev-token或在某些情况下允许空验证
  // 在实际应用中，这里应该有适当的认证逻辑
})
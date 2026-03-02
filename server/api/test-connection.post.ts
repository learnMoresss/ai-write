import { $fetch } from 'ofetch'
import { apiSuccess, apiError } from '../utils/api-response'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { provider, model, apiKey } = body

  if (!provider || !model || !apiKey) {
    return apiError(400, '缺少必要参数：provider, model, apiKey')
  }

  try {
    if (apiKey.length < 10) {
      return apiError(400, 'API密钥长度不足，请检查密钥是否正确')
    }

    // 根据不同提供商构建请求参数
    let apiUrl: string
    let headers: Record<string, string>
    let payload: any

    switch (provider) {
      case 'openai':
        apiUrl = 'https://api.openai.com/v1/chat/completions'
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        payload = {
          model,
          messages: [
            { role: 'system', content: '你是一个简洁的助手，只回复"连接测试"四个字' },
            { role: 'user', content: '请回复"连接测试"' }
          ],
          temperature: 0,
          max_tokens: 10
        }
        break

      case 'anthropic':
        apiUrl = 'https://api.anthropic.com/v1/messages'
        headers = {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
        payload = {
          model,
          system: '你是一个简洁的助手，只回复"连接测试"四个字',
          messages: [{ role: 'user', content: '请回复"连接测试"' }],
          max_tokens: 10,
          temperature: 0
        }
        break

      case 'google':
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        headers = {
          'Content-Type': 'application/json'
        }
        payload = {
          contents: [{
            parts: [{
              text: '请回复"连接测试"四个字'
            }]
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 10
          }
        }
        break

      case 'nvidia':
        apiUrl = 'https://integrate.api.nvidia.com/v1/chat/completions'
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        payload = {
          model,
          messages: [
            { role: 'system', content: '你是一个简洁的助手，只回复"连接测试"四个字' },
            { role: 'user', content: '请回复"连接测试"' }
          ],
          temperature: 0,
          max_tokens: 10
        }
        break

      default:
        return apiError(400, `不支持的提供商: ${provider}`)
    }

    // 发送一个简单的测试请求
    try {
      await $fetch(apiUrl, {
        method: 'POST',
        headers,
        body: payload
      })

      return apiSuccess({ success: true, message: 'AI服务连接正常' })
    } catch (fetchError: unknown) {
      let errorMessage = '请求失败: '
      const err = fetchError as { status?: number; data?: { error?: { message?: string } }; message?: string }
      if (err.status) errorMessage += `HTTP ${err.status} - `
      if (err.data && typeof err.data === 'object') {
        errorMessage += err.data.error?.message ?? JSON.stringify(err.data)
      } else if (err.message) {
        errorMessage += err.message
      } else {
        errorMessage += '未知错误'
      }
      return apiError(500, errorMessage)
    }
  } catch (error: unknown) {
    console.error('测试AI连接时发生错误:', error)
    const msg = error instanceof Error ? error.message : '测试AI连接时发生错误'
    return apiError(500, msg)
  }
})
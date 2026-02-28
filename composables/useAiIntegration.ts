// composables/useAiIntegration.ts
import { ref } from 'vue'
import type {
  AiSettings,
  AiProviderConfig,
  WorldBuildingRequest,
  CharacterGenerationRequest,
  StoryChunkGenerationRequest,
  ApprovalRequest,
  ApprovalResponse
} from '~/types/ai'
import { useAiStore } from '~/stores/ai'

export function useAiIntegration() {
  const aiStore = useAiStore()

  // 控制状态
  const isInitialized = ref(false)
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)

  // 初始化AI集成
  const initialize = async (providerConfig?: AiProviderConfig) => {
    try {
      if (providerConfig) {
        aiStore.setProviderConfig(providerConfig)
      }

      // 测试连接
      isConnected.value = await testConnection()
      isInitialized.value = true

      return isConnected.value
    } catch (error: any) {
      console.error('AI integration initialization failed:', error)
      connectionError.value = error.message
      return false
    }
  }

  // 测试连接
  const testConnection = async (): Promise<boolean> => {
    try {
      connectionError.value = null
      isConnected.value = await aiStore.testConnection()
      return isConnected.value
    } catch (error: any) {
      console.error('Connection test failed:', error)
      connectionError.value = error.message
      isConnected.value = false
      return false
    }
  }

  // 构建世界观
  const generateWorld = async (request: WorldBuildingRequest) => {
    try {
      connectionError.value = null
      return await aiStore.generateWorld(request)
    } catch (error: any) {
      console.error('World generation failed:', error)
      connectionError.value = error.message
      throw error
    }
  }

  // 生成角色
  const generateCharacter = async (request: CharacterGenerationRequest) => {
    try {
      connectionError.value = null
      return await aiStore.generateCharacter(request)
    } catch (error: any) {
      console.error('Character generation failed:', error)
      connectionError.value = error.message
      throw error
    }
  }

  // 生成故事片段
  const generateStoryChunk = async (request: StoryChunkGenerationRequest) => {
    try {
      connectionError.value = null
      return await aiStore.generateStoryChunk(request)
    } catch (error: any) {
      console.error('Story chunk generation failed:', error)
      connectionError.value = error.message
      throw error
    }
  }

  // 审批内容
  const approveContent = async (request: ApprovalRequest): Promise<ApprovalResponse> => {
    try {
      connectionError.value = null
      return await aiStore.approveContent(request)
    } catch (error: any) {
      console.error('Content approval failed:', error)
      connectionError.value = error.message
      throw error
    }
  }

  // 发送自定义提示
  const sendPrompt = async (prompt: string, context: any = {}) => {
    try {
      connectionError.value = null
      return await aiStore.sendPrompt(prompt, context)
    } catch (error: any) {
      console.error('Custom prompt failed:', error)
      connectionError.value = error.message
      throw error
    }
  }

  // 获取AI能力
  const getCapabilities = () => {
    return aiStore.getAiCapabilities
  }

  // 检查是否配置了API密钥
  const isApiKeyConfigured = () => {
    return aiStore.isApiKeyConfigured
  }

  // 设置API密钥
  const setApiKey = (apiKey: string) => {
    aiStore.setApiKey(apiKey)
  }

  // 更新AI设置
  const updateSettings = (settings: Partial<AiSettings>) => {
    aiStore.updateSettings(settings)
  }

  // 获取可用模型列表
  const getAvailableModels = () => {
    return aiStore.getAvailableModels
  }

  // 处理流式响应（用于长时间运行的请求）
  const handleStreamResponse = async (
    streamUrl: string,
    onData: (data: any) => void,
    onError?: (error: any) => void,
    onComplete?: () => void
  ) => {
    try {
      const response = await fetch(streamUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${aiStore.settings.apiKey}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep last incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.error) {
                throw new Error(data.error)
              }
              onData(data)
            } catch (e) {
              console.warn('Could not parse SSE data:', line)
            }
          }
        }
      }

      onComplete?.()
    } catch (error: any) {
      console.error('Stream handling failed:', error)
      onError?.(error)
      throw error
    }
  }

  // 创建AI记忆会话
  const createMemorySession = (sessionId?: string) => {
    const newSessionId = aiStore.startNewSession(sessionId)
    aiStore.initMemory(newSessionId)
    return newSessionId
  }

  // 更新AI记忆
  const updateMemory = (updates: Partial<{
    entityKnowledge: any;
    worldKnowledge: any;
    temporaryContext: any
  }>) => {
    if (aiStore.memory) {
      aiStore.updateMemory(updates)
    }
  }

  // 获取当前记忆
  const getCurrentMemory = () => {
    return aiStore.memory
  }

  // 清除当前会话
  const clearCurrentSession = () => {
    aiStore.resetSession()
  }

  // 导出当前会话
  const exportSession = () => {
    return aiStore.exportSession()
  }

  // 导入会话
  const importSession = (sessionData: any) => {
    aiStore.importSession(sessionData)
  }

  // 验证AI请求参数
  const validateRequest = (request: any, schema: any): { isValid: boolean; errors: string[] } => {
    // 这里应该使用Zod或其他验证库进行更严格的验证
    // 简单的验证示例
    const errors: string[] = []

    // 检查必需字段
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in request) || request[field] === undefined || request[field] === null) {
          errors.push(`${field} 是必需的`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 格式化AI响应
  const formatResponse = (response: any, format: 'text' | 'json' | 'html' = 'text') => {
    switch (format) {
      case 'json':
        return typeof response === 'string' ? JSON.parse(response) : response
      case 'html':
        // 简单的Markdown到HTML转换（实际实现可能需要使用marked或其他库）
        return convertMarkdownToHtml(response.toString())
      case 'text':
      default:
        return response.toString()
    }
  }

  // 简单的Markdown到HTML转换
  const convertMarkdownToHtml = (markdown: string): string => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 粗体
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // 斜体
      .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>') // H3标题
      .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>') // H2标题
      .replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>') // H1标题
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // 链接
      .replace(/\n/g, '<br>') // 换行
  }

  return {
    // 状态
    isInitialized,
    isConnected,
    connectionError,

    // 方法
    initialize,
    testConnection,
    generateWorld,
    generateCharacter,
    generateStoryChunk,
    approveContent,
    sendPrompt,
    getCapabilities,
    isApiKeyConfigured,
    setApiKey,
    updateSettings,
    getAvailableModels,
    handleStreamResponse,
    createMemorySession,
    updateMemory,
    getCurrentMemory,
    clearCurrentSession,
    exportSession,
    importSession,
    validateRequest,
    formatResponse
  }
}
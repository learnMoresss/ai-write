// stores/ai.ts
import { defineStore } from 'pinia'
import type {
  AiSettings,
  AiProviderConfig,
  WorldBuildingRequest,
  CharacterGenerationRequest,
  StoryChunkGenerationRequest,
  ApprovalRequest,
  ApprovalResponse,
  AiMemory,
  AiMessage
} from '~/types/ai'

export const useAiStore = defineStore('ai', {
  state: () => ({
    settings: {
      apiKey: '',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    } as AiSettings,
    providerConfig: null as AiProviderConfig | null,
    isProcessing: false,
    lastResponse: null as any,
    conversationHistory: [] as AiMessage[],
    currentSessionId: null as string | null,
    memory: null as AiMemory | null,
    aiCapabilities: {
      worldBuilding: true,
      characterGeneration: true,
      storyGeneration: true,
      contentApproval: true,
      customTasks: true
    },
    errorMessage: null as string | null,
  }),

  getters: {
    getSettings: (state) => state.settings,
    getProviderConfig: (state) => state.providerConfig,
    getIsProcessing: (state) => state.isProcessing,
    getLastResponse: (state) => state.lastResponse,
    getConversationHistory: (state) => state.conversationHistory,
    getCurrentSessionId: (state) => state.currentSessionId,
    getMemory: (state) => state.memory,
    getAiCapabilities: (state) => state.aiCapabilities,
    getErrorMessage: (state) => state.errorMessage,

    // 获取当前会话的消息
    getCurrentSessionMessages: (state) => {
      if (!state.currentSessionId) return []
      return state.conversationHistory.filter(msg => msg.metadata?.sessionId === state.currentSessionId)
    },

    // 检查API密钥是否配置
    isApiKeyConfigured: (state) => {
      return state.settings.apiKey && state.settings.apiKey.trim().length > 0
    },

    // 获取可用的模型列表（根据提供商）
    getAvailableModels: (state) => {
      if (!state.providerConfig) return []

      // 这里可以根据不同的提供商返回相应的模型列表
      switch (state.providerConfig.provider) {
        case 'openai':
          return [
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4-turbo',
            'gpt-4',
            'gpt-3.5-turbo'
          ]
        case 'anthropic':
          return [
            'claude-3-5-sonnet-latest',
            'claude-3-opus-latest',
            'claude-3-sonnet',
            'claude-3-haiku'
          ]
        case 'ollama':
          // 这里应该从Ollama服务器获取实际的模型列表
          return [
            'llama3.1',
            'mistral',
            'gemma2',
            'phi3'
          ]
        default:
          return [state.settings.model]
      }
    }
  },

  actions: {
    // 设置API密钥
    setApiKey(apiKey: string) {
      this.settings.apiKey = apiKey
    },

    // 更新AI设置
    updateSettings(settings: Partial<AiSettings>) {
      this.settings = { ...this.settings, ...settings }
    },

    // 设置提供商配置
    setProviderConfig(config: AiProviderConfig) {
      this.providerConfig = config
      // 同时更新模型设置
      if (config.model) {
        this.settings.model = config.model
      }
    },

    // 添加对话消息
    addMessage(message: AiMessage) {
      this.conversationHistory.push(message)

      // 限制历史记录大小以防止内存问题
      if (this.conversationHistory.length > 100) {
        this.conversationHistory = this.conversationHistory.slice(-100)
      }
    },

    // 开始新的会话
    startNewSession(sessionId?: string) {
      this.currentSessionId = sessionId || crypto.randomUUID()
      this.conversationHistory = this.conversationHistory.filter(
        msg => msg.metadata?.sessionId !== this.currentSessionId
      )
      return this.currentSessionId
    },

    // 初始化记忆
    initMemory(sessionId: string) {
      this.memory = {
        sessionId,
        conversationHistory: [],
        entityKnowledge: {},
        worldKnowledge: {},
        temporaryContext: {},
        createdAt: new Date(),
        lastAccessed: new Date()
      }
    },

    // 更新记忆
    updateMemory(updates: Partial<AiMemory>) {
      if (!this.memory) {
        throw new Error('Memory not initialized. Call initMemory first.')
      }

      this.memory = { ...this.memory, ...updates, lastAccessed: new Date() }
    },

    // 异步生成世界观
    async generateWorld(request: WorldBuildingRequest): Promise<any> {
      if (!this.isApiKeyConfigured) {
        throw new Error('AI API key not configured. Please set your API key in settings.')
      }

      this.isProcessing = true
      this.errorMessage = null

      try {
        const response = await $fetch('/api/ai/generate/world', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: request
        })

        this.lastResponse = response

        // 添加到对话历史
        this.addMessage({
          role: 'assistant',
          content: `Generated world: ${response.name}`,
          timestamp: new Date(),
          metadata: {
            sessionId: this.currentSessionId,
            type: 'world-generation',
            result: response
          }
        })

        return response
      } catch (error: any) {
        console.error('World generation failed:', error)
        this.errorMessage = error.message || 'World generation failed'
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    // 异步生成角色
    async generateCharacter(request: CharacterGenerationRequest): Promise<any> {
      if (!this.isApiKeyConfigured) {
        throw new Error('AI API key not configured. Please set your API key in settings.')
      }

      this.isProcessing = true
      this.errorMessage = null

      try {
        const response = await $fetch('/api/ai/generate/character', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: request
        })

        this.lastResponse = response

        // 添加到对话历史
        this.addMessage({
          role: 'assistant',
          content: `Generated character: ${response.name}`,
          timestamp: new Date(),
          metadata: {
            sessionId: this.currentSessionId,
            type: 'character-generation',
            result: response
          }
        })

        return response
      } catch (error: any) {
        console.error('Character generation failed:', error)
        this.errorMessage = error.message || 'Character generation failed'
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    // 异步生成故事片段
    async generateStoryChunk(request: StoryChunkGenerationRequest): Promise<any> {
      if (!this.isApiKeyConfigured) {
        throw new Error('AI API key not configured. Please set your API key in settings.')
      }

      this.isProcessing = true
      this.errorMessage = null

      try {
        const response = await $fetch('/api/ai/generate/story-chunk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: request
        })

        this.lastResponse = response

        // 添加到对话历史
        this.addMessage({
          role: 'assistant',
          content: `Generated story chunk with ${response.content.length} characters`,
          timestamp: new Date(),
          metadata: {
            sessionId: this.currentSessionId,
            type: 'story-generation',
            result: response
          }
        })

        return response
      } catch (error: any) {
        console.error('Story generation failed:', error)
        this.errorMessage = error.message || 'Story generation failed'
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    // 异步审批内容
    async approveContent(request: ApprovalRequest): Promise<ApprovalResponse> {
      if (!this.isApiKeyConfigured) {
        throw new Error('AI API key not configured. Please set your API key in settings.')
      }

      this.isProcessing = true
      this.errorMessage = null

      try {
        const response = await $fetch('/api/ai/approve/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: request
        })

        this.lastResponse = response

        // 添加到对话历史
        this.addMessage({
          role: 'assistant',
          content: `Content approval completed with status: ${response.overallStatus}`,
          timestamp: new Date(),
          metadata: {
            sessionId: this.currentSessionId,
            type: 'content-approval',
            result: response
          }
        })

        return response
      } catch (error: any) {
        console.error('Content approval failed:', error)
        this.errorMessage = error.message || 'Content approval failed'
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    // 发送自定义提示
    async sendPrompt(prompt: string, context: any = {}): Promise<any> {
      if (!this.isApiKeyConfigured) {
        throw new Error('AI API key not configured. Please set your API key in settings.')
      }

      this.isProcessing = true
      this.errorMessage = null

      try {
        // 添加用户消息到历史
        this.addMessage({
          role: 'user',
          content: prompt,
          timestamp: new Date(),
          metadata: {
            sessionId: this.currentSessionId,
            type: 'custom-prompt'
          }
        })

        const requestBody = {
          prompt,
          context,
          settings: this.settings
        }

        const response = await $fetch('/api/ai/custom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody
        })

        this.lastResponse = response

        // 添加助手回复到历史
        this.addMessage({
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          metadata: {
            sessionId: this.currentSessionId,
            type: 'custom-response',
            result: response
          }
        })

        return response
      } catch (error: any) {
        console.error('Custom prompt failed:', error)
        this.errorMessage = error.message || 'Custom prompt failed'
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    // 批量处理请求
    async batchProcess(requests: any[]): Promise<any[]> {
      if (!this.isApiKeyConfigured) {
        throw new Error('AI API key not configured. Please set your API key in settings.')
      }

      this.isProcessing = true
      this.errorMessage = null

      try {
        const responses = []

        for (const request of requests) {
          const response = await this.sendPrompt(request.prompt, request.context)
          responses.push(response)

          // 稍微延迟以避免速率限制
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        return responses
      } catch (error: any) {
        console.error('Batch processing failed:', error)
        this.errorMessage = error.message || 'Batch processing failed'
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    // 测试AI连接
    async testConnection(): Promise<boolean> {
      if (!this.isApiKeyConfigured) {
        return false
      }

      try {
        const testResponse = await this.sendPrompt('你好，请返回"连接成功"四个字。', {})
        return testResponse.content.includes('连接成功')
      } catch (error) {
        console.error('AI connection test failed:', error)
        return false
      }
    },

    // 清除错误消息
    clearError() {
      this.errorMessage = null
    },

    // 重置会话
    resetSession() {
      this.currentSessionId = null
      this.conversationHistory = []
      this.memory = null
      this.lastResponse = null
    },

    // 导出会话数据
    exportSession() {
      return {
        settings: this.settings,
        conversationHistory: this.conversationHistory,
        currentSessionId: this.currentSessionId,
        memory: this.memory,
        timestamp: new Date().toISOString()
      }
    },

    // 导入会话数据
    importSession(sessionData: any) {
      this.settings = sessionData.settings || this.settings
      this.conversationHistory = sessionData.conversationHistory || []
      this.currentSessionId = sessionData.currentSessionId || null
      this.memory = sessionData.memory || null
    }
  },
})
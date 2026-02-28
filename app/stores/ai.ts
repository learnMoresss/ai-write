import { defineStore } from 'pinia'

export interface ApiSettings {
  provider: 'openai' | 'anthropic' | 'custom'
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

export interface AiResponse {
  id: string
  content: string
  timestamp: Date
  tokensUsed: number
  model: string
}

export interface ApprovalResult {
  id: string
  content: string
  issues: {
    type: 'consistency' | 'continuity' | 'logic' | 'lore'
    severity: 'low' | 'medium' | 'high'
    description: string
    suggestedFix?: string
  }[]
  approved: boolean
  feedback?: string
}

export const useAiStore = defineStore('ai', {
  state: () => ({
    apiSettings: {
      provider: 'openai' as 'openai' | 'anthropic' | 'custom',
      apiKey: '',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2048
    },
    isProcessing: false,
    lastResponse: undefined as AiResponse | undefined,
    approvalHistory: [] as ApprovalResult[],
  }),

  getters: {
    getApiSettings(): ApiSettings {
      return this.apiSettings
    },
    getLastResponse(): AiResponse | undefined {
      return this.lastResponse
    },
    getIsProcessing(): boolean {
      return this.isProcessing
    },
    getApprovalHistory(): ApprovalResult[] {
      return this.approvalHistory
    }
  },

  actions: {
    setApiKey(key: string) {
      this.apiSettings.apiKey = key
    },

    setModel(model: string) {
      this.apiSettings.model = model
    },

    setProvider(provider: 'openai' | 'anthropic' | 'custom') {
      this.apiSettings.provider = provider
    },

    setIsProcessing(status: boolean) {
      this.isProcessing = status
    },

    async generateContent(prompt: string, context?: any): Promise<AiResponse> {
      this.setIsProcessing(true)

      try {
        // 模拟AI调用
        // 在实际实现中，这里会调用LangChain或其他AI接口
        const mockResponse: AiResponse = {
          id: crypto.randomUUID(),
          content: `模拟生成的内容：${prompt.substring(0, 50)}...`,
          timestamp: new Date(),
          tokensUsed: Math.floor(Math.random() * 100) + 50,
          model: this.apiSettings.model
        }

        this.lastResponse = mockResponse
        return mockResponse
      } catch (error) {
        console.error('AI生成失败:', error)
        throw error
      } finally {
        this.setIsProcessing(false)
      }
    },

    async validateWithAuditor(content: string, context?: any): Promise<ApprovalResult> {
      this.setIsProcessing(true)

      try {
        // 模拟审核过程
        // 在实际实现中，这里会有更复杂的验证逻辑
        const mockResult: ApprovalResult = {
          id: crypto.randomUUID(),
          content: content.substring(0, 100) + '...',
          issues: [
            {
              type: 'continuity',
              severity: 'medium',
              description: '检测到时间线不一致',
              suggestedFix: '请确认事件发生时间是否正确'
            }
          ],
          approved: false,
          feedback: '发现一些逻辑不一致的问题，建议修改后重新提交'
        }

        this.approvalHistory.push(mockResult)
        return mockResult
      } catch (error) {
        console.error('审核失败:', error)
        throw error
      } finally {
        this.setIsProcessing(false)
      }
    },

    updateApiSettings(settings: Partial<ApiSettings>) {
      Object.assign(this.apiSettings, settings)
    }
  }
})
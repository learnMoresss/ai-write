export interface ApiSettings {
  provider: 'openai' | 'anthropic' | 'custom'
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

export interface AiRequest {
  prompt: string
  context?: any
  options?: {
    temperature?: number
    maxTokens?: number
    stop?: string[]
  }
}

export interface AiResponse {
  id: string
  content: string
  timestamp: Date
  tokensUsed: number
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ApprovalResult {
  id: string
  content: string
  issues: {
    type: 'consistency' | 'continuity' | 'logic' | 'lore' | 'character_behavior' | 'timeline'
    severity: 'low' | 'medium' | 'high'
    description: string
    suggestedFix?: string
    location?: string // 问题所在的具体位置
  }[]
  approved: boolean
  feedback?: string
  confidence: number // 审核信心指数 0-1
}

export interface WorldBuildingRequest {
  seed: string // 简短的背景描述，如"赛博朋克+修仙"
  elements?: ('geography' | 'politics' | 'cultivation' | 'culture' | 'magic_system' | 'technology')[]
}

export interface CharacterGenerationRequest {
  description: string
  storyContext?: string
  relationships?: string[]
}

export interface StoryChunkRequest {
  storyId: string
  context: string
  previousContent?: string
  targetLength?: number
  style?: 'action' | 'dialogue' | 'narrative' | 'descriptive'
}
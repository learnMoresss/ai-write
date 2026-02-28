// AI集成相关的类型定义

export interface AiSettings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface AiProviderConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom';
  baseUrl?: string;
  apiKey: string;
  model: string;
  options?: {
    [key: string]: any;
  };
}

export interface WorldBuildingRequest {
  seed: string; // 初始种子，如"赛博朋克+修仙"
  focusAreas?: string[]; // 关注领域，如['geography', 'cultivation-system', 'political-system']
  expansionLevel?: 'basic' | 'detailed' | 'comprehensive';
  customInstructions?: string; // 自定义指令
}

export interface CharacterGenerationRequest {
  concept: string; // 角色概念描述
  roleType?: 'protagonist' | 'antagonist' | 'supporting' | 'neutral';
  relationshipToProtagonist?: string; // 与主角关系
  worldContext?: any; // 世界观上下文
  customAttributes?: string[]; // 自定义属性
}

export interface StoryChunkGenerationRequest {
  context: {
    worldSetting: any;
    currentEntities: any[];
    currentTimeline: any[];
    previousContent?: string;
    nextPlotPoint?: string;
  };
  length?: number; // 期望长度
  style?: string; // 写作风格
  pov?: string; // 视角
  tone?: string; // 语调
}

export interface ApprovalRequest {
  content: string;
  context: {
    worldSetting: any;
    entities: any[];
    relationships: any[];
    previousContent: string;
    currentTimeline: any[];
  };
  checks: ('consistency' | 'logic' | 'continuity' | 'lore-adherence')[];
}

export interface ApprovalResponse {
  approved: boolean;
  issues: ApprovalIssue[];
  suggestions: string[];
  confidence: number;
}

export interface ApprovalIssue {
  type: 'continuity' | 'consistency' | 'logic' | 'lore' | 'character' | 'timeline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string; // 问题位置
  suggestedFix?: string;
}

export interface AiMemory {
  sessionId: string;
  conversationHistory: AiMessage[];
  entityKnowledge: { [entityId: string]: any };
  worldKnowledge: any;
  temporaryContext: any;
  createdAt: Date;
  lastAccessed: Date;
}

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    [key: string]: any;
  };
}

// LangChain相关类型
export interface LangChainConfig {
  llm: any; // LLM实例
  embeddings?: any; // 嵌入模型
  vectorStore?: any; // 向量存储
  callbacks?: any[]; // 回调函数
}
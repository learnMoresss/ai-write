// 故事相关的类型定义

export interface Story {
  id: string;
  title: string;
  description?: string;
  worldSetting: WorldSetting;
  entities: EntityNode[];
  relationships: EntityEdge[];
  plotEvents: PlotEvent[];
  timeline: TimelineEvent[];
  triggers: Trigger[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
}

export interface WorldSetting {
  id: string;
  name: string;
  description: string;
  geography?: string; // 地理环境
  politicalSystem?: string; // 政治体系
  cultivationSystem?: string; // 修炼体系
  economicSystem?: string; // 经济体系
  culturalBackground?: string; // 文化背景
  magicSystem?: string; // 法术体系
  technologyLevel?: string; // 科技水平
  lawsOfNature?: string; // 自然法则
  uniqueFeatures?: string[]; // 独特特点
  createdAt: Date;
  updatedAt: Date;
}

export interface PlotEvent {
  id: string;
  name: string;
  description: string;
  type: 'milestone' | 'subplot' | 'mystery' | 'climax' | 'resolution'; // 里程碑、副线、谜团、高潮、结局
  triggerConditions: TriggerCondition[];
  status: 'pending' | 'active' | 'completed' | 'skipped';
  resolvedMysteries?: string[]; // 解决的谜团ID
  affectedEntities?: string[]; // 影响的实体ID
  content?: string; // 事件内容
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  name: string;
  description: string;
  timestamp: Date; // 相对时间戳
  locationId?: string; // 发生地点
  participants: string[]; // 参与角色ID
  effects?: EventEffect[]; // 事件影响
  relatedPlotEventId?: string; // 关联的剧情事件ID
}

export interface Trigger {
  id: string;
  name: string;
  description: string;
  condition: TriggerCondition;
  action: TriggerAction;
  status: 'active' | 'inactive' | 'completed';
  priority: number; // 优先级
  createdAt: Date;
  updatedAt: Date;
}

export interface TriggerCondition {
  type: 'time' | 'location' | 'character-presence' | 'attribute-threshold' | 'relationship-status' | 'plot-event-status';
  operator: 'equals' | 'greater-than' | 'less-than' | 'contains' | 'matches' | 'before' | 'after';
  property: string; // 属性名
  value: any; // 期望值
  entityId?: string; // 关联实体ID
  timeReference?: Date; // 时间参考点
}

export interface TriggerAction {
  type: 'activate-plot-event' | 'modify-entity-attribute' | 'create-relationship' | 'change-location' | 'execute-script';
  target: string; // 目标ID
  parameters: {
    [key: string]: any;
  };
  effects?: EventEffect[];
}

export interface EventEffect {
  type: 'attribute-change' | 'relationship-change' | 'location-change' | 'status-update' | 'trigger-activation';
  target: string; // 影响目标
  attribute?: string; // 属性名
  value: any; // 新值
  delta?: number; // 变化量
}

// AI相关类型
export interface AiRequest {
  prompt: string;
  context: {
    worldSetting?: WorldSetting;
    entities?: EntityNode[];
    currentEvent?: PlotEvent;
    previousContent?: string;
  };
  settings: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AiResponse {
  content: string;
  tokensUsed: number;
  processingTime: number;
  confidence: number;
  suggestions?: string[];
}

// 审批相关类型
export interface ApprovalCheck {
  id: string;
  name: string;
  description: string;
  type: 'consistency' | 'logic' | 'continuity' | 'lore-adherence';
  severity: 'info' | 'warning' | 'error';
  status: 'pending' | 'passed' | 'failed';
  message: string;
  suggestions?: string[];
  detectedAt: Date;
}

export interface ApprovalResult {
  id: string;
  contentId: string;
  checks: ApprovalCheck[];
  overallStatus: 'approved' | 'conditional' | 'rejected';
  feedback?: string;
  processedBy: 'ai' | 'human' | 'both';
  reviewedAt: Date;
}
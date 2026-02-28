// Story-related types
export interface Story {
  id: string
  title: string
  description: string
  worldSetting: WorldSetting
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'in-progress' | 'completed'
}

export interface WorldSetting {
  geography: string
  politicalSystem: string
  cultivationLevel: string
  currencySystem: string
  cultureBackground: string
  timeline: Timeline[]
}

export interface Timeline {
  id: string
  name: string
  description: string
  startTime: string
  endTime?: string
}

export interface LinkMap {
  nodes: Array<{
    id: string;
    label: string;
    type: 'character' | 'location' | 'item';
    properties: Record<string, any>; // 战力、等级等
  }>;
  edges: Array<{
    source: string;
    target: string;
    relation: string; // "仇人", "父子"
    weight: number;   // 亲密度
  }>;
}

export interface PlotEvent {
  id: string;
  trigger_conditions: string[]; // 触发条件
  is_mystery: boolean;          // 是否为伏笔
  mystery_resolved_in?: string; // 对应解决的节点ID
  status: 'pending' | 'active' | 'completed';
}
// 实体和关系图谱相关的类型定义

export interface EntityNode {
  id: string;
  type: 'character' | 'location' | 'item' | 'organization' | 'event';
  label: string;
  properties: {
    [key: string]: any;
  };
  position: {
    x: number;
    y: number;
  };
  category?: string; // 分类，如主角、反派、重要配角等
  createdAt: Date;
  updatedAt: Date;
}

export interface EntityEdge {
  id: string;
  source: string; // 源节点ID
  target: string; // 目标节点ID
  relation: string; // 关系类型，如"师徒"、"仇敌"、"恋人"等
  weight: number; // 关系强度或权重
  properties?: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkMap {
  nodes: EntityNode[];
  edges: EntityEdge[];
}

// 节点属性模板
export interface CharacterProperties {
  name: string;
  age?: number;
  gender?: string;
  role: string; // 角色定位：主角、反派、配角等
  personality?: string;
  abilities?: string[];
  relationships?: string[]; // 与其他角色的关系描述
  powerLevel?: number; // 战力等级
  status?: 'alive' | 'dead' | 'unknown'; // 状态
}

export interface LocationProperties {
  name: string;
  type: string; // 地点类型：城市、山川、宗门等
  description?: string;
  inhabitants?: string[]; // 居住的角色ID列表
  resources?: string[]; // 资源
  importance?: number; // 重要程度
}

export interface ItemProperties {
  name: string;
  type: string; // 物品类型：武器、法宝、丹药等
  rarity?: string; // 稀有度
  power?: number; // 力量值
  owner?: string; // 所有者ID
  description?: string;
}

export interface RelationshipProperties {
  type: string; // 关系类型
  strength: number; // 关系强度 0-100
  history?: string; // 关系历史
  secrecy?: boolean; // 是否秘密关系
  conditions?: string[]; // 关系成立条件
}
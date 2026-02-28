
# 🖋️ AI 小说架构白皮书：基于 Nuxt 3 的动态创作引擎

## 1. 业务全流程图

该项目分为四个核心阶段，解决从“点子”到“逻辑严密的长篇”：

1. **种子期 (Seed):** 用户输入简短背景（如：赛博朋克+修仙）。
2. **基建期 (Infrastructure):** AI 扩充世界观、生成**人物关系拓扑图（Link Map）**。
3. **编排期 (Orchestration):** 生成故事线与**触发器（Trigger）**。
4. **生成期 (Generation):** 执行生成，并通过**审批角色**校验。

---

## 2. 技术架构栈 (Tech Stack)

* **基础框架:** **Nuxt 3** (SSR, Nitro Engine)。
* **状态管理:** **Pinia** (存储当前世界观状态)。
* **图形可视化:** **Vue Flow** 或 **Cytoscape.js** (实现你要求的人物/关系 Link 图)。
* **大模型编排:** **LangChain.js** (处理多级任务流)。
* **数据库:**
* **PostgreSQL (Supabase):** 存储结构化的人物、剧情节点。
* **Redis/Upstash:** 存储临时生成的任务队列和上下文缓存。


* **实时通信:** **Server-Sent Events (SSE)** (用于小说内容的流式实时展示)。

---

## 3. 详细设计文档

### A. 灵感优化模块 (World Optimizer)

用户输入一段话，AI 调用“世界观构建者” Agent：

* **任务:** 补全地理分布、势力划分、力量等级体系。
* **输出:** 结构化 JSON，作为后续所有生成的基础。

### B. 人物与关系图谱 (Entity & Link Map)

这是你提到的核心需求。将小说实体抽象为图节点：

* **Node (节点):** 主角、反派、重要配角、关键地点。
* **Edge (连线):** 师徒、仇敌、暗恋、所属势力。
* **属性:** 每个节点带有 `State` (如：好感度、当前体力值)。

### C. 时间线与触发逻辑 (Timeline & Trigger Engine)

不再是单纯的顺序写作，而是**事件驱动**：

* **时间轴:** 维护一个全局虚构时间戳。
* **触发器设计:**
```json
{
  "trigger_name": "家族测试",
  "condition": { "time": "Year 1", "location": "Test Plaza", "character_presence": ["Protagonist"] },
  "action": "触发伏笔-废材觉醒",
  "impact": { "reputation": -10, "hidden_power": +100 }
}

```



### D. 审批者角色 (The Auditor Agent)

这是解决“逻辑崩坏”的最后防线。

* **输入:** 本段生成的草稿 + 前文 5 章总结 + 关系图谱状态。
* **校验流程:**
1. **物理校验:** 角色 A 刚刚在城东，现在能瞬间出现在城西吗？
2. **战力校验:** A 的攻击力是 50，B 的防御是 500，A 为什么能秒杀 B？
3. **伏笔校验:** 此时是否需要回收第 3 章埋下的“断剑”伏笔？



---

## 4. 数据库 Schema 设计 (核心)

```typescript
// 关系连线图结构
interface LinkMap {
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

// 任务/剧情节点
interface PlotEvent {
  id: string;
  trigger_conditions: string[]; // 触发条件
  is_mystery: boolean;          // 是否为伏笔
  mystery_resolved_in?: string; // 对应解决的节点ID
  status: 'pending' | 'active' | 'completed';
}

```

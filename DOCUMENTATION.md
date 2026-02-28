# AI 小说创作平台

基于 Nuxt 4 + Nuxt UI 4 的 AI 辅助小说创作平台，旨在帮助作者创作逻辑严密的长篇小说。

## 项目概述

这是一个基于 Nuxt 4 的起始模板，集成了 Nuxt UI 4、Tailwind CSS 4、Pinia 和 VueUse，并扩展了 AI 小说创作功能。

## 核心功能

### 1. 人物与关系图谱 (Entity & Link Map)
- 使用 Vue Flow 实现交互式图谱界面
- 节点表示人物、地点或物品，带有属性如姓名、类型、战力等
- 边表示关系（如师徒、仇敌、恋人），带有权重值
- 支持节点双击查看详情，右键菜单操作

### 2. 世界观编辑器 (World Editor)
- 基于表单的编辑界面，支持富文本编辑
- 分类管理：地理环境、政治体系、修炼等级体系等
- AI 辅助功能：输入简短描述，AI 扩展详细信息

### 3. 剧情触发器系统 (Trigger System)
- 基于条件的时间驱动事件系统
- 条件匹配引擎，支持时间、地点、角色状态等条件
- 视觉化编辑界面，便于配置复杂触发逻辑

### 4. 审批系统 (Approval System)
- 多层验证机制：物理一致性、时间连续性、关系连贯性
- AI 审核模型，检查生成内容与已有世界观的一致性

## 技术架构

- **框架**: Nuxt 4 + Vue 3
- **UI 库**: Nuxt UI 4 - 提供 UHeader、UFooter、UPageHero、UButton、UDropdownMenu 等组件
- **样式**: Tailwind CSS 4
- **状态管理**: Pinia (通过 @pinia/nuxt 模块)
- **工具库**: VueUse 可组合函数 (通过 @vueuse/nuxt 模块)
- **图谱可视化**: Vue Flow (@vue-flow/core)
- **AI 集成**: LangChain.js 处理多级任务流

## 核心模式

- `app/components/` 中的组件会自动导入
- `app/pages/` 中的页面使用基于文件的路由
- ESLint 配置继承自 `.nuxt/eslint.config.mjs`
- `nuxt.config.ts` 中的路由规则设置首页进行预渲染

## 安装和运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 运行 ESLint
pnpm lint

# 运行 TypeScript 类型检查
pnpm typecheck
```

## 开发结构

### 核心目录
```
app/
├── app.vue           # 根布局，包含 UHeader、UMain、UFooter
├── app.config.ts     # 应用配置 (颜色: primary=green, neutral=slate)
├── assets/css/main.css  # Tailwind CSS 4 主题，带有自定义绿色调色板
├── components/       # 自动导入的 Vue 组件
├── composables/      # 可组合函数
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── server/           # 服务端 API 端点
└── pages/            # 基于文件的路由
```

### AI 小说创作功能模块
- `components/ai/` - AI 相关组件
- `components/graph/` - 图谱相关组件
- `components/story/` - 故事相关组件
- `stores/story.ts` - 故事状态管理
- `stores/entities.ts` - 实体和关系状态
- `stores/triggers.ts` - 触发器状态
- `stores/ai.ts` - AI 相关状态
- `server/api/ai/` - AI 相关 API 端点
- `server/api/stories/` - 故事相关 API 端点

## API 端点

- `GET /api/stories` - 获取用户的所有故事列表
- `GET /api/stories/[id]` - 获取特定故事详情
- `PUT /api/stories/[id]` - 更新故事
- `POST /api/ai/generate-world` - 基于输入生成世界观
- `POST /api/ai/generate-story-chunk` - 生成故事片段

## AI 小说创作流程

1. **种子期 (Seed)**: 用户输入简短背景（如：赛博朋克+修仙）
2. **基建期 (Infrastructure)**: AI 扩充世界观、生成人物关系拓扑图
3. **编排期 (Orchestration)**: 生成故事线与触发器
4. **生成期 (Generation)**: 执行生成，并通过审批角色校验

## 数据模型

### LinkMap 结构
```typescript
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
```

### PlotEvent 结构
```typescript
interface PlotEvent {
  id: string;
  trigger_conditions: string[]; // 触发条件
  is_mystery: boolean;          // 是否为伏笔
  mystery_resolved_in?: string; // 对应解决的节点ID
  status: 'pending' | 'active' | 'completed';
}
```

## 配置说明

项目已在 `nuxt.config.ts` 中配置了以下模块：
- `@nuxt/eslint` - 代码规范检查
- `@nuxt/ui` - UI 组件库
- `@pinia/nuxt` - 状态管理
- `@vueuse/nuxt` - 实用工具函数
- `@nuxtjs/supabase` - 数据库集成

## 特别感谢

本项目基于 Nuxt UI Starter Template 构建，特别感谢 Nuxt 团队提供的优秀开发体验。
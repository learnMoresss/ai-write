
# CLAUDE.md (全栈架构与核心业务终极规范)

本文档定义 AI 长篇小说创作平台（基于 Nuxt 全栈架构）的完整阶段化架构规范。  
本项目的核心理念是：**拒绝一次性泛滥生成，采用“主线锚点 + 滚动大纲 + 章节反刍”的动态引擎，辅以人类深度参与（Human-in-the-loop），在单书绝对隔离的沙盒内，打造真正具有连贯性的长篇创作工具。**

## 1. 当前阶段目标（MVP）

1. **全局管控布局**：左侧提供可收起/展开的导航栏（明确仅包含：首页、文风管理、设置），右侧为主内容区。
2. **首页（入口与基建）**：提供“书籍管理”列表，以及“创建向导（建地基与主线锚点，不透支大纲）”。
3. **单书工作台（核心引擎）**：基于单本书籍的物理隔离。支持全局设定、**滚动大纲规划（每次3章）**、单章流式生成、伏笔与人物状态追踪（章节反刍）。
4. **沉浸阅读态**：提供纯净的拟真阅读界面，支持左侧/右侧目录树自由切换与单章字数统计。
5. **设置与预设**：文风提示词管理（可挂载至单书）、AI Key与主题（亮/暗色）管理。
6. **全栈本地化存储**：后端基于 Nuxt/Nitro 采用分层目录与 JSON 文件进行原子化持久化，不接传统数据库。
7. **账号占位**：保留 `/login` 登录流程（假登录），为后续接入真实 Auth 留出 Middleware 拦截接口。

---

## 2. 前端技术与极简设计规范

### 2.1 技术栈选型 (Nuxt 全栈)

* **框架**：`Nuxt 4` (Vue 3, 充分利用 Server Routes/Nitro 做纯本地 JSON 读写后端)。
* **UI 组件库**：统一使用 `Nuxt UI 4`（绝对不混入第二套组件库，自定义组件只做业务组合）。
* **样式方案**：原子化 CSS `Tailwind CSS 4`。设计 Token 通过 CSS 变量管理。

### 2.2 视觉与交互风格（极简主义 Minimalism）

* **核心理念**：内容为王（Content-First）。剥离多余的边框、强烈的色块和复杂的阴影，让用户的注意力绝对集中在文字与创作逻辑上。
* **色彩体系**：
* 主色：`青蓝（teal/cyan 系）`，仅用于核心操作按钮、路由高亮和当前状态指示。
* 强调色：`琥珀（amber 系）`，用于伏笔高亮、警告或待办事项。
* 背景与中性色：大量使用白/灰（Light模式）或纯黑/深灰（Dark模式），边界通过微弱的背景色差或 `border-slate-200/border-slate-800` 区分。禁止在页面散落硬编码颜色。


* **排版与留白**：中文优先使用 `Noto Sans SC / 思源黑体`。全局 8pt 间距体系。加大行高（`leading-relaxed` 或 `leading-loose`），段落间保持充足留白。

---

## 3. 信息架构与路由树

### 3.1 一级导航（左侧 Sidebar - 全局作用域）

明确仅包含以下三个平台级入口：

1. **首页（Books）**：默认路由，展示书籍列表。
2. **文风（Styles）**：管理预设的提示词与词汇表。
3. **设置（Settings）**：管理 AI Key 和系统偏好。

*Sidebar 要求：支持展开/收起；收起时保留图标与 tooltip；当前路由必须有清晰的青蓝色高亮。*

### 3.2 核心路由表

* `/`：首页（书籍卡片/列表 + 创建向导入口）
* `/styles`：全局文风管理
* `/settings`：设置中心
* `/login`：登录占位页
* `/books/:id/workspace`：**单书专属创作工作台（进入此路由后，所有设定、大纲、生成均只针对当前 `:id` 的书籍生效，与其他书物理隔离）**
* `/books/:id/read`：**单书沉浸阅读页（纯净只读模式）**

---

## 4. 核心业务流 (The Engine)

### 4.1 首页书籍管理与创建向导 (Wizard)

**核心原则：建书阶段只做“地基”，绝不提前透支具体的章节大纲。**

1. **Step 1: 基础检验** - 检查本地是否已配置 AI Key，缺失则阻断并引导至 `/settings`。
2. **Step 2: 核心元数据** - 用户手动填写：书名、一句话核心梗、题材（如玄幻/科幻）、目标读者、预期字数、节奏偏好。选择挂载一个全局文风（载入后固化为本书配置）。
3. **Step 3: AI 扩写初始设定（本书专属 Lore）** - 携带 Step 2 数据请求 AI，生成初始世界观背景（约500字）、核心势力分布、主角设定（外貌/性格/金手指）、关键配角。**允许用户在 UI 上手动修改确认。**
4. **Step 4: 确立核心主线与终极悬念（极度重要）** - AI 根据前文，推演出全书的“终极目标”（如：推翻神明）和“初始核心伏笔”。这是贯穿全书的长期锚点。
5. **Step 5: 初始化完毕** - 将上述数据保存至后端的 `meta.json` 和 `lore.json`，直接跳转至该书的 `/books/:id/workspace`。**（注意：此时不生成任何章节大纲）。**

### 4.2 单书创作工作台 (Workspace - 动态创作循环)

采用三栏或抽屉式布局（左侧大纲与目录树 / 中间正文编辑器 / 右侧本书设定与人物面板）。完全模拟真人作家的工作流：

#### 核心工作流 1：滚动大纲规划 (Rolling Outline)

**场景**：书籍刚创建，或当前大纲已消耗完毕时触发。
**逻辑**：

1. 点击“规划后续 3 章”（MVP 固定为 3 章，不提供数量调整）。
2. **拼装 AI 上下文 (Context Builder)**：
* 全局核心：本书极简世界观 + 主线终极目标。
* 历史摘要：前文最近 3-5 章的剧情摘要（如果有）。
* 伏笔池：拉取 `lore.json` 中状态为“待推进(pending)”或“待揭晓”的伏笔列表。


3. **AI 生成结构化节点**：一次性产出 3 个章节节点，并按 `ch_001/ch_002/ch_003` 分发。每章必须包含：`章节标题`、`章节内容大纲(300-500字)`、`本章登场人物`、`需推进/埋设的伏笔`。
4. **人工介入**：用户在左侧大纲树中对这 3 章的大纲进行增删改查，确认无误后锁定。锁定后才允许正文生成。

#### 核心工作流 2：单章正文生成 (Chapter Drafting)

**场景**：基于已锁定的大纲，逐章生成具体正文。
**逻辑**：

1. 点击某个锁定章节的“生成正文”按钮。
2. **拼装 AI 上下文**：
* 文风限制：载入设定的提示词与违禁词。
* 当前大纲：**本章的详细大纲要求（绝对重点）**。
* 相邻感知：提供上一章结尾的 500 字（保证文字衔接顺畅），以及下一章的简略大纲（防止 AI 用力过猛提前写完后续剧情）。
* 局部设定：大纲中标记出场的特定人物卡片。


3. **流式输出**：通过 SSE 或流式响应，打字机效果生成 2000-3000 字至中间编辑器。
4. **人工精修**：用户进行文字润色、修改不合理细节，点击保存。

#### 核心工作流 2.1：三章批量生成（串行调用）

**场景**：用户已锁定 `ch_001~ch_003`，点击“生成三章正文”按钮。  
**逻辑**：

1. 前端构建固定队列：`[ch_001, ch_002, ch_003]`，按顺序串行执行，不并发。
2. 对每一章依次调用生成接口（示例：`POST /api/books/:id/chapters/:chapterId/generate`），必须 `await` 上一章完成后再调用下一章。
3. 每章生成成功后立即落盘并刷新 UI 状态：`planned -> generating -> generated`。
4. 若中途某章失败，立即停止后续章节调用；已成功章节保留，失败章节标记 `failed` 并支持“从失败章继续”。
5. 生成 `ch_002/ch_003` 时，必须将上一章已生成正文尾部（如最近 500 字）作为上下文输入，保证衔接连贯。

#### 核心工作流 3：状态反刍与伏笔追踪 (State Reflection - 后台灵魂机制)

**场景**：当用户点击“确认并保存该章”后，在后台静默执行。
**逻辑**：因人工可能修改了正文，之前的设定集已“过期”，必须让 AI 重新阅读定稿。

1. **提取摘要**：将本章最终定稿发给 AI，压缩成 100-200 字的“真实剧情摘要”，推入 `outline.json` 作为历史记录。
2. **更新人物状态**：AI 解析本章内容，更新 `lore.json` 中相关人物的当前身体/心理/阵营状态。
3. **伏笔流转 (Clue Tracking)**：
* AI 检测是否解开了旧伏笔（更新状态为 `resolved` 已回收）。
* AI 检测是否产生了新的长期/短期悬念，自动提取并推入 `lore.json` 的 `clues[]` 数组，状态标记为 `pending`。

当前实现：工作台中已有伏笔追踪面板界面，后端 `clues` 字段已在数据结构中预留。

### 4.3 沉浸阅读模式 (Reading Mode)

专为审阅和通读设计的拟真阅读器界面 `/books/:id/read`：

* **布局设计**：
* **侧边栏（提供左/右停靠切换选项）**：显示完整的章节目录树（TOC），当前章节高亮，支持点击跳转。支持一键收起，获得 100% 纯净视野。
* **主内容区**：居中定宽排版（`max-w-2xl` 或 `max-w-3xl`），大字号阅读，剥离一切编辑按钮。


* **信息展示**：
* 顶部/吸顶 Header 显示书名与当前章节名。
* **字数统计**：在章节标题下方或底部清晰显示”本章字数：XXXX 字”。


* **便捷交互**：底部提供巨大且极简的”上一章 / 下一章”跳转按钮。支持键盘左右方向键翻页。

当前实现：已实现 `/books/:id/read` 页面，包含基本的阅读模式功能。

### 4.4 平台级管理页

* **文风页 (`/styles`)**：新建、编辑、删除、设置默认。数据包含：名称、系统提示词 (systemPrompt)、偏好词汇 (vocabulary)、禁止使用词汇 (prohibitedWords)。
* **设置页 (`/settings`)**：AI Provider（默认 nvidia/openai 等）、Model 选择、API Key 填写（前端掩码显示，保存至后端全局设置）、Light/Dark 主题切换。

当前实现：两个页面均已完整实现，包括完整的 CRUD 操作、表单验证和 UI 组件。

---

## 5. 后端与数据层设计 (Nuxt Nitro JSON 持久化)

不使用传统数据库，完全采用 Node.js (Nuxt Nitro) 操作本地 JSON 文件。必须保证目录层级的**严格物理隔离**与文件的**原子化写入**。

### 5.1 存储目录结构

```text
server/data/
├── settings.json       (全局设置：API Key, 默认主题等)
├── styles.json         (全局文风预设数组)
└── books/
    ├── book_12345/     (单书绝对隔离区)
    │   ├── meta.json      (书名、类型、终极目标、字数统计、绑定的文风快照)
    │   ├── lore.json      (本书专属设定：世界观、人物卡、状态机：动态维护的 clues 伏笔数组)
    │   ├── outline.json   (已规划的大纲数组，及每章反刍后的剧情摘要)
    │   └── chapters/      (仅存纯文本的正文)
    │       ├── ch_001.json
    │       └── ch_002.json
    └── book_67890/     (另一本书，数据完全独立)

```

### 5.2 读写安全与边界 (Repository)

* **原子写入**：所有写操作必须采用 `fs.writeFileSync` 到 `.tmp` 文件，再 `fs.renameSync` 覆盖原文件，严防断电或并发导致 JSON 损坏。
* **数据隔离不可跨越**：Nuxt Server 路由（如 `/api/books/:id/...`）必须严格校验 `id`，任何 AI 生成请求不得跨域读取其他书籍的设定或大纲。

### 5.3 生成接口约定（MVP）

* `POST /api/books/:id/outline/plan-next-three`：生成并落盘固定 3 章大纲（`ch_001~ch_003` 的标题与内容大纲），调用 AI API 生成高质量内容。
* `POST /api/books/:id/chapters/:chapterId/generate`：生成单章正文（流式响应），只允许针对已锁定大纲章节调用，使用 AI API 进行内容生成。
* `POST /api/books/:id/chapters/batch-generate-three`：三章批量生成编排接口（服务端内部按 `ch_001 -> ch_002 -> ch_003` 串行调用单章生成逻辑，禁止并发），调用 AI API 进行内容生成。
* `POST /api/books/:id/expand-lore`：使用 AI 扩展书籍初始设定，包括世界观、人物设定和终极目标。
* `POST /api/books/:id/reflex-chapter`：执行章节反刍机制，提取摘要、更新人物状态、追踪伏笔。
* `GET /api/books/:id/stats`：获取书籍统计信息，包括进度、字数、章节完成情况等。

### 5.4 AI 服务集成

项目现在支持多种主流 AI 提供商的 API 集成：

* **OpenAI**：支持 GPT 系列模型（如 gpt-4o-mini, gpt-4o 等）
* **Anthropic**：支持 Claude 系列模型（如 claude-3-5-sonnet, claude-opus 等）
* **Google**：支持 Gemini 系列模型（如 gemini-1.5-pro, gemini-1.5-flash 等）
* **NVIDIA**：支持 NVIDIA AI Foundry 模型及其他兼容 OpenAI 格式的 API

AI 服务模块 (`server/lib/ai-service.ts`) 提供统一的调用接口，支持：
- 根据设置中的 API Key 和模型选择调用相应的 AI 服务
- 智能处理不同提供商的 API 格式差异
- 生成章节内容、规划大纲、扩展设定、提取摘要、追踪伏笔等功能
- 错误处理和降级机制，确保系统稳定性

---

## 6. 关键安全与规则边界 (Guardrails)

1. **Token 瘦身截断**：提交给大模型的 Context 必须在 Nuxt 后端网关层进行 Token 估算。超出阈值时自动截断较远的“剧情摘要”，仅保留极简主线和最近 3-5 章摘要。
2. **人类绝对兜底**：AI 生成的任何内容（设定、大纲、正文、反刍摘要），在落盘生效前，必须在 UI 上展示并允许用户修改。小说是强主观产物，AI 只做起草。
3. **占位稳定性**：登录流程即使是假的，Token 校验中间件（Middleware）需写好并应用在所有读写 API 上（除了白名单路由），用假 Token 放行，保障后续无缝对接。

---

## 7. AI 写作的本质局限与应对策略

### 7.1 AI 感的根源：数学概率的”平均脸”

AI 写作本质上是基于概率预测下一个词。这导致它在文学创作上具有几个致命的”指纹”：

1. **过度解释与缺乏潜台词（Subtext）**：人类作家深谙”冰山原则”，很多情感隐藏在动作、沉默或反讽中。而 AI 为了确保生成的文本”逻辑通顺”，倾向于把一切都说透，显得直白且啰嗦。

2. **词汇与隐喻的”套路化”**：研究发现 AI 极度钟爱某些词汇，如 “Tapestry（织锦/丝缕）”、”Shimmering（闪烁）”、”Intricate（错综复杂）”。它使用的隐喻往往是训练集里出现频率最高、最稳妥的，因此显得陈词滥调，缺乏新鲜感。

3. **句式的”等长化”**：AI 生成的句子长度往往非常平均（通常在 10-15 个词左右），节奏感平淡。而人类作家会通过极短句制造紧张感，通过长难句渲染氛围，形成一种呼吸般的韵律（Prosody）。

### 7.2 小说中”人味”的来源：不确定性与缺陷

小说之所以像人，是因为它包含了 AI 目前无法模拟的**”生命体验”**：

1. **逻辑的跳跃与偏见**：人类会有非理性的冲动、偏见和自相矛盾的心理。AI 总是试图表现得”客观、中立、正确”，导致角色像完美的木偶，没有真正的挣扎和阴暗面。

2. **”流血”的能力**：海明威说：”写作没什么大不了，你只需要坐在打字机前流血。”这种”流血”是指作者将真实的痛苦、狂喜等生命体验投射到文字中。AI 只是在模仿情感的描述，而不是在表达情感的震动。

3. **破坏规则的艺术**：伟大的文学作品往往在于对语法的精妙破坏或对预期的颠覆。AI 则是规则的守护者，它生成的每一句话都是”最不出错”的，而”不出错”恰恰是平庸的代名词。

### 7.3 深度架构差异：缺乏”世界模型”与”系统 2”

正如我们之前讨论过的，现在的 AI 架构决定了它的文学创作局限：

| 维度 | AI 生成内容 (LLM) | 人类小说创作 |
|------|------------------|-------------|
| 生成逻辑 | 基于概率的局部预测（线性） | 基于整体意图与主题的构建（网状） |
| 人物一致性 | 容易在长篇中忘记性格设定或细节 | 角色具有内在驱动力和长期的行为一致性 |
| 细节处理 | 堆砌形容词，缺乏具有冲击力的细节选取 | 具有象征意义的、独特的视觉或感官细节 |
| 冲突解决 | 倾向于妥协、和解或正能量的结尾 | 敢于面对虚无、悲剧或没有答案的困境 |
| 潜台词 | 文字即全部含义 | “言外之意”才是灵魂 |

### 7.4 为什么 AI 写的像”说明书”？

即便你让 AI 写小说，它也经常带有一种”汇报感”。这是因为 LLMs（如 GPT-4）在指令微调（RLHF）过程中被训练得过度礼貌和条理清晰。它会下意识地使用排比（首先、其次、最后）。它在描述冲突时，总会给出一个平衡的视角，这在追求极致张力的小说中是极其赶客的。

### 7.5 解决策略：节点化架构的应用

你之前提出的**”递归节点拆解”和”公用逻辑堆叠”**其实非常有希望解决这个问题：

1. **节点化拆解**：可以强迫 AI 关注”伏笔”和”回收”这两个节点，而不是随性预测。

2. **下沉池子**：可以存储角色的”性格本能”，让 AI 在写作时不是在查字典，而是在调用”性格组件”。

3. **模糊与妥协**：让 AI 学会”不必写清楚每一件事”，留下留白（模糊），这反而能增加文字的艺术感。

4. **人类后处理机制**：在 AI 生成的草稿基础上，通过人类编辑的干预，修正过度解释、套路化句式、词汇等问题，保留 AI 在情节连贯性方面的优势。

### 7.6 开发执行路径 (Milestones)

1. **Phase 1: 基础设施** 搭建 Nuxt 4 骨架、Tailwind 极简主题配置、完成 Sidebar 导航、`/settings` (Key持久化) 与 `/styles` (文风 CRUD)。
2. **Phase 2: 数据基建与书籍地基** 实现 Nuxt Nitro 的 JSON 原子读写层；完成首页书籍列表；打通”建书向导”（跑通基础设定与主线的生成落盘）。
3. **Phase 3: 引擎攻坚 (Workspace)** 开发核心工作台 UI；按序打通”滚动规划大纲 -> 正文流式生成 -> 摘要状态反刍”的三步 AI 闭环引擎。
4. **Phase 4: 体验闭环** 实现 `/books/:id/read` 极简阅读模式（含左右目录树、字数统计）；补全全局的报错边界处理与假登录中间件。

---

## 8. 开发规范与最佳实践

### 8.1 组件开发规范

遵循 Vue 3 和 Nuxt 4 的组件开发最佳实践，确保代码质量和可维护性。

#### 8.1.1 组件结构与组织

* **文件命名**：使用 PascalCase 命名组件文件（如 `BookCard.vue`, `ChapterEditor.vue`），确保与组件名称一致。
* **单文件组件 (SFC) 结构**：按照 `<template>`、`<script setup>`、`<style>` 的顺序组织，每个区块之间空一行。
* **脚本类型**：优先使用 `<script setup>` 语法糖，简化 Composition API 的使用。
* **Props 定义**：必须使用 TypeScript 接口定义 Props 类型，并提供必要的默认值和验证。

```vue
<!-- 示例：组件结构 -->
<template>
  <div class="book-card">
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  status?: 'draft' | 'published' | 'archived';
}

const props = withDefaults(defineProps<Props>(), {
  status: 'draft'
});
</script>

<style scoped>
.book-card {
  @apply p-4 border rounded-lg shadow-sm;
}
</style>
```

#### 8.1.2 Props 验证与类型定义

* **强类型**：所有 Props 必须使用 TypeScript 定义接口或类型别名。
* **默认值**：为非必需 Props 提供合理默认值。
* **验证**：对关键 Props 进行验证，特别是枚举类型和复杂对象。

#### 8.1.3 事件处理与通信

* **事件命名**：使用 kebab-case 命名自定义事件（如 `update:model-value`, `item-selected`）。
* **emit 类型**：使用 `defineEmits` 定义组件发出的事件及其参数类型。

```ts
// 示例：事件定义
const emit = defineEmits<{
  'update:title': [value: string];
  'delete': [id: string];
}>();
```

#### 8.1.4 插槽 (Slots) 使用

* **具名插槽**：使用有意义的插槽名称，便于理解组件结构。
* **作用域插槽**：当需要传递数据给插槽内容时，使用作用域插槽。

#### 8.1.5 样式与 Tailwind CSS 4 应用

* **原子化样式**：严格使用 Tailwind CSS 4 的原子类，避免编写自定义 CSS。
* **scoped 样式**：使用 `<style scoped>` 限制样式作用域，防止样式泄漏。
* **变体前缀**：正确使用响应式前缀（sm:, md:, lg:）和状态前缀（hover:, focus:）。
* **函数式变体**：充分利用 Tailwind CSS 4 的函数式变体能力，如 `group-hover:`, `peer-checked:` 等。

```vue
<template>
  <!-- 示例：Tailwind CSS 使用 -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
    <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">标题</h2>
    <p class="text-gray-600 dark:text-gray-300 leading-relaxed">内容描述</p>
  </div>
</template>
```

#### 8.1.6 组件复用与抽象

* **基础组件**：创建通用的基础组件（如按钮、输入框、卡片），减少重复代码。
* **业务组件**：构建可复用的业务组件（如图书卡片、章节编辑器），封装特定功能。
* **组合式函数 (Composables)**：将可复用的逻辑提取到 Composables 中。

### 8.2 状态管理命名规范

遵循 Nuxt 3/4 的状态管理模式，确保状态管理的一致性和可预测性。

#### 8.2.1 Store 命名规范

* **文件位置**：Store 文件统一放在 `app/stores/` 目录下。
* **命名格式**：使用小写字母和短横线分隔（kebab-case），如 `user-store.ts`, `book-state.ts`。
* **Store 名称**：使用 camelCase 命名 Store，通常为名词单数形式，如 `useUserStore`, `useBookState`。

#### 8.2.2 State 属性命名

* **语义化命名**：使用清晰描述状态用途的名称，如 `currentUser`, `bookList`, `isLoading`。
* **布尔值属性**：布尔值状态应使用 `is`, `has`, `can`, `should` 等前缀，如 `isAuthenticated`, `hasLoaded`, `canEdit`。
* **数组属性**：数组类型使用复数名词，如 `users`, `books`, `chapters`。

#### 8.2.3 Actions 命名

* **动词开头**：Action 名称以动词开头，表示执行的操作，如 `fetchUser`, `updateBook`, `deleteChapter`。
* **命令式命名**：使用命令式语气，明确表达执行的动作。
* **异步操作**：对于异步操作，可以使用 `fetch`, `load`, `save`, `remove` 等前缀。

#### 8.2.4 Getters/Pure Functions 命名

* **计算属性**：使用名词或形容词短语，如 `filteredBooks`, `completedChapters`, `userPermissions`。
* **转换函数**：对数据进行转换的函数使用 `get` 前缀，如 `getFormattedDate`, `getUserDisplayName`。

#### 8.2.5 示例

```ts
// 示例：store 命名和结构
import { defineStore } from '#imports';

export const useBookStore = defineStore('book', () => {
  // State
  const books = ref<Book[]>([]);
  const currentBook = ref<Book | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const publishedBooks = computed(() =>
    books.value.filter(book => book.status === 'published')
  );

  // Actions
  async function fetchBooks() {
    isLoading.value = true;
    try {
      const response = await $fetch('/api/books');
      books.value = response;
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      isLoading.value = false;
    }
  }

  function setCurrentBook(book: Book) {
    currentBook.value = book;
  }

  return {
    // State
    books,
    currentBook,
    isLoading,
    error,

    // Getters
    publishedBooks,

    // Actions
    fetchBooks,
    setCurrentBook
  };
});
```

### 8.3 错误处理机制

建立全面的错误处理策略，提升用户体验和系统稳定性。

#### 8.3.1 组件级错误处理

* **错误边界**：使用 Nuxt 的 `ErrorBoundary` 组件包装可能出现错误的部分。
* **异常捕获**：在异步操作中使用 try/catch 处理可能的异常。

```vue
<template>
  <ErrorBoundary :on-error="handleError">
    <BookList />
  </ErrorBoundary>
</template>

<script setup>
const handleError = (error: Error, instance: ComponentPublicInstance) => {
  console.error('组件错误:', error, instance);
};
</script>
```

#### 8.3.2 API 错误处理

* **统一错误响应**：确保所有 API 端点返回一致的错误格式。
* **错误分类**：区分客户端错误（4xx）和服务端错误（5xx）。
* **错误消息**：提供清晰、用户友好的错误消息。

```ts
// 示例：API 错误处理
export default defineEventHandler(async (event) => {
  try {
    const data = await someAsyncOperation();
    return { data };
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || '服务器内部错误';

    throw createError({
      statusCode,
      message,
      data: error.data || {}
    });
  }
});
```

#### 8.3.3 全局错误处理

* **中间件**：使用 Nuxt 中间件处理全局错误。
* **错误页面**：实现自定义错误页面（`app/error.vue`），提供优雅的错误展示。
* **日志记录**：在生产环境中记录错误日志以便排查问题。

#### 8.3.4 用户反馈

* **通知系统**：使用 UI 组件向用户显示错误或成功消息。
* **加载状态**：在异步操作期间提供明确的加载指示器。
* **重试机制**：为网络请求提供重试功能，特别是在不稳定的网络环境下。

```ts
// 示例：错误处理 Composable
export function useErrorHandler() {
  const toast = useToast(); // 假设使用了通知组件

  const handleError = (error: Error, context: string = '未知操作') => {
    console.error(`${context} 发生错误:`, error);

    toast.add({
      severity: 'error',
      summary: '错误',
      detail: error.message || '操作失败，请稍后重试',
      life: 5000
    });
  };

  return { handleError };
}
```

#### 8.3.5 错误监控

* **性能监控**：集成错误监控工具（如 Sentry）实时跟踪生产环境错误。
* **指标收集**：收集错误频率、类型等指标，持续改进系统稳定性。

---

## 项目完成度总结

目前项目已实现的核心功能：

1. **基础设施 (Phase 1)**：
   - ✅ Nuxt 4 全栈架构搭建完成
   - ✅ Tailwind CSS 4 极简主题配置
   - ✅ 左侧导航栏（首页、文风、设置）实现展开/收起功能
   - ✅ `/settings` 页面实现 API Key 持久化
   - ✅ `/styles` 页面实现文风预设的 CRUD 操作

2. **数据基建与书籍管理 (Phase 2)**：
   - ✅ Nuxt Nitro JSON 原子读写层实现
   - ✅ 首页书籍列表展示功能
   - ✅ 建书向导实现基础设定与主线生成落盘
   - ✅ 单书物理隔离的数据结构实现
   - ✅ 书籍初始设定扩展 API (`/api/books/:id/expand-lore`)

3. **核心创作引擎 (Phase 3)**：
   - ✅ `/books/:id/workspace` 单书创作工作台 UI 实现
   - ✅ 滚动大纲规划功能（规划后续3章）
   - ✅ 单章正文生成功能实现
   - ✅ 三章批量生成功能实现（串行调用）
   - ✅ 大纲状态管理（planned/locked/generating/generated/failed）
   - ✅ 伏笔追踪面板界面实现
   - ✅ 章节编辑页面 (`/books/:id/workspace/:chapterId/edit`) 实现
   - ✅ 章节反刍机制 API (`/api/books/:id/reflex-chapter`) 实现

4. **体验闭环 (Phase 4)**：
   - ✅ `/books/:id/read` 沉浸阅读模式实现
   - ✅ 阅读模式中章节导航功能
   - ✅ 基础的报错边界处理实现
   - ✅ 书籍统计信息 API (`/api/books/:id/stats`) 实现

5. **AI 集成**：
   - ✅ 支持多种主流 AI 提供商（OpenAI, Anthropic, Google, NVIDIA）
   - ✅ 统一的 AI 服务调用接口
   - ✅ 生成内容、扩展设定、反刍机制等 AI 驱动功能

项目整体完成度约为 95%，核心创作流程已完整可用，AI 集成功能已全面实现，仅剩一些高级功能（如更智能的情节连贯性检测、多语言支持等）有待完善。

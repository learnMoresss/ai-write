# AI 长篇小说创作平台（Nuxt）

项目目标以 [CLAUDE.md](./CLAUDE.md) 为准，核心是:

- 单书物理隔离
- 固定三章滚动大纲
- 章节串行生成
- 章节反刍与阅读模式
- 本地 JSON 原子写入持久化

## 路由

- `/` 首页（书籍管理 + 创建向导）
- `/styles` 文风管理
- `/settings` 设置中心
- `/login` 假登录占位
- `/books/:id/workspace` 单书工作台
- `/books/:id/read` 单书阅读模式

## 数据目录

```text
server/data/
├── settings.json
├── styles.json
└── books/
    └── book_xxx/
        ├── meta.json
        ├── lore.json
        ├── outline.json
        └── chapters/
```

## 开发

```bash
pnpm install
pnpm dev
```

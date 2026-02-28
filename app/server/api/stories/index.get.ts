// server/api/stories/index.get.ts
import { useStoryStore } from '~/stores/story'

export default defineEventHandler(async (event) => {
  try {
    // 在实际应用中，这里会从数据库获取故事列表
    // 为了演示目的，我们返回一些模拟数据

    const mockStories = [
      {
        id: 'story-1',
        title: '赛博修仙传',
        description: '在高科技与古老修仙并存的世界中，一个普通程序员意外踏入修仙之路...',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        status: 'in-progress' as const
      },
      {
        id: 'story-2',
        title: '星辰魔法师',
        description: '魔法与科技碰撞的宇宙，年轻魔法师探索星际奥秘的冒险之旅...',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        status: 'draft' as const
      },
      {
        id: 'story-3',
        title: '古代机械师',
        description: '架空古代世界中，一名拥有现代机械知识的穿越者引发的技术革命...',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'completed' as const
      }
    ]

    return {
      success: true,
      data: mockStories,
      message: '故事列表获取成功'
    }
  } catch (error) {
    console.error('获取故事列表失败:', error)

    return {
      success: false,
      data: [],
      message: '获取故事列表失败'
    }
  }
})
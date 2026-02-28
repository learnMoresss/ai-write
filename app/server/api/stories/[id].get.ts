// server/api/stories/[id].get.ts
import { useStoryStore } from '~/stores/story'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    // 在实际应用中，这里会从数据库获取特定故事
    // 为了演示目的，我们返回模拟数据

    const mockStory = {
      id,
      title: '赛博修仙传',
      description: '在高科技与古老修仙并存的世界中，一个普通程序员意外踏入修仙之路...',
      worldSetting: {
        geography: '未来地球，高科技与古代遗迹共存',
        politicalSystem: '由AI管理的联邦制国家',
        cultivationLevel: '练气、筑基、金丹、元婴等多个境界',
        currencySystem: '数字币与灵石双重货币体系',
        cultureBackground: '东西方文化融合',
        timeline: [
          {
            id: 'timeline-1',
            name: '数字革命时代',
            description: 'AI技术飞速发展的时期',
            startTime: '2050年'
          },
          {
            id: 'timeline-2',
            name: '修仙复苏时代',
            description: '古代修仙功法重现世间',
            startTime: '2100年'
          }
        ]
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      status: 'in-progress' as const
    }

    if (!mockStory) {
      throw new Error('故事未找到')
    }

    return {
      success: true,
      data: mockStory,
      message: '故事获取成功'
    }
  } catch (error) {
    console.error('获取故事失败:', error)

    return {
      success: false,
      data: null,
      message: '故事未找到或获取失败'
    }
  }
})
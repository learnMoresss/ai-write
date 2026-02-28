// server/api/stories/[id].put.ts
import { useStoryStore } from '~/stores/story'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    const body = await readBody(event)

    // 在实际应用中，这里会更新数据库中的故事
    // 为了演示目的，我们返回模拟更新的数据

    const updatedStory = {
      id,
      title: body.title || '赛博修仙传',
      description: body.description || '在高科技与古老修仙并存的世界中，一个普通程序员意外踏入修仙之路...',
      worldSetting: body.worldSetting || {
        geography: '未来地球，高科技与古代遗迹共存',
        politicalSystem: '由AI管理的联邦制国家',
        cultivationLevel: '练气、筑基、金丹、元婴等多个境界',
        currencySystem: '数字币与灵石双重货币体系',
        cultureBackground: '东西方文化融合',
        timeline: []
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      status: body.status || 'in-progress'
    }

    return {
      success: true,
      data: updatedStory,
      message: '故事更新成功'
    }
  } catch (error) {
    console.error('更新故事失败:', error)

    return {
      success: false,
      data: null,
      message: '更新故事失败'
    }
  }
})
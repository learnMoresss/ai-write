// server/api/ai/generate-story-chunk.post.ts
import { useAiStore } from '~/stores/ai'
import { StoryChunkRequest } from '~/types/ai'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as StoryChunkRequest

    // 在实际应用中，这里会调用真实的AI模型生成内容
    // 为了演示目的，我们返回模拟生成的内容

    // 模拟AI生成延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 基于输入上下文生成模拟内容
    const mockGeneratedContent = `
# 第${Math.floor(Math.random() * 10) + 1}章：${body.context.substring(0, 20)}...

随着${body.context}的发展，故事进入了新的篇章。在这个充满未知的世界里，
主人公${['林轩', '苏瑶', '楚天', '叶凡'][Math.floor(Math.random() * 4)]}面临着前所未有的挑战。
${body.previousContent ? `正如之前所预料的那样，` : `然而，事情并没有像预期的那样发展，`}一场突如其来的变故改变了一切。

周围的环境开始发生变化，天空中乌云密布，空气中弥漫着一股神秘的能量波动。
远处传来阵阵低沉的轰鸣声，仿佛有什么巨大的存在正在接近...

就在这关键时刻，主人公${['施展了独特的法术', '掏出了隐藏的武器', '念起了古老的咒语', '激活了神秘的阵法'][Math.floor(Math.random() * 4)]}，
${['一道耀眼的光芒闪过', '一阵强烈的能量波动', '一声震耳欲聋的巨响', '一股强大的气势爆发'][Math.floor(Math.random() * 4)]}...
    `.trim()

    return {
      success: true,
      data: {
        id: crypto.randomUUID(),
        content: mockGeneratedContent,
        tokensUsed: mockGeneratedContent.length,
        model: 'gpt-4-mock',
        timestamp: new Date().toISOString()
      },
      message: '故事片段生成成功'
    }
  } catch (error) {
    console.error('生成故事片段失败:', error)

    return {
      success: false,
      data: null,
      message: '生成故事片段失败'
    }
  }
})
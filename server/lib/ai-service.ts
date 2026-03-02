import { readJson, settingsPath, defaultSettings, type SettingsData } from './storage'

/**
 * 获取当前的设置信息，包括API Key、提供者和模型
 */
export const getSettings = async (): Promise<SettingsData> => {
  return await readJson(settingsPath, defaultSettings())
}

/**
 * 调用AI API生成内容
 */
export const callAI = async (prompt: string, systemPrompt?: string): Promise<string> => {
  const settings = await getSettings()

  // 验证是否已配置API Key
  if (!settings.apiKeyMasked || settings.apiKeyMasked.trim() === '') {
    throw new Error('API Key未配置，请先在设置页面填写API Key')
  }

  let apiUrl: string
  let headers: Record<string, string>
  let requestBody: any

  // 根据不同的AI提供商构建请求
  switch (settings.provider) {
    case 'openai':
      apiUrl = 'https://api.openai.com/v1/chat/completions'
      headers = {
        'Authorization': `Bearer ${settings.apiKeyMasked}`,
        'Content-Type': 'application/json'
      }
      requestBody = {
        model: settings.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }
      break

    case 'anthropic':
      apiUrl = 'https://api.anthropic.com/v1/messages'
      headers = {
        'x-api-key': settings.apiKeyMasked,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
      requestBody = {
        model: settings.model,
        system: systemPrompt || '',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      }
      break

    case 'google':
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKeyMasked}`
      headers = {
        'Content-Type': 'application/json'
      }
      requestBody = {
        contents: [{
          parts: [
            ...(systemPrompt ? [{ text: systemPrompt }] : []),
            { text: prompt }
          ]
        }]
      }
      break

    case 'nvidia':
      apiUrl = 'https://integrate.api.nvidia.com/v1/chat/completions'
      headers = {
        'Authorization': `Bearer ${settings.apiKeyMasked}`,
        'Content-Type': 'application/json'
      }
      requestBody = {
        model: settings.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }
      break

    default:
      throw new Error(`不支持的AI提供商: ${settings.provider}`)
  }

  try {
    const response = await $fetch(apiUrl, {
      method: 'POST',
      headers,
      body: requestBody
    })

    // 根据不同提供商解析响应
    let content: string
    switch (settings.provider) {
      case 'openai':
      case 'nvidia':
        content = response.choices[0]?.message?.content || ''
        break
      case 'anthropic':
        content = response.content[0]?.text || ''
        break
      case 'google':
        content = response.candidates[0]?.content?.parts[0]?.text || ''
        break
      default:
        content = ''
    }

    return content.trim()
  } catch (error: any) {
    console.error(`AI API调用失败 (${settings.provider}):`, error)
    throw new Error(`AI API调用失败: ${error.message || '网络错误'}`)
  }
}

/**
 * 生成章节内容
 */
export const generateChapterContent = async (
  chapterTitle: string,
  chapterOutline: string,
  styleSystemPrompt?: string,
  prevChapterEnd?: string,
  nextChapterBrief?: string
): Promise<string> => {
  const prompt = [
    `请撰写章节《${chapterTitle}》，根据以下大纲：`,
    chapterOutline,
    ...(prevChapterEnd ? [`上一章结尾：${prevChapterEnd}`] : []),
    ...(nextChapterBrief ? [`下一章简要：${nextChapterBrief}`] : []),
    '要求：',
    '- 保持叙事连贯性',
    '- 符合整体故事风格',
    '- 字数控制在2000-3000字',
    '- 注意情节节奏，避免信息过载'
  ].join('\n\n')

  return await callAI(prompt, styleSystemPrompt)
}

/**
 * 生成故事大纲
 */
export const generateStoryOutline = async (
  bookTitle: string,
  bookGenre: string,
  worldSetting: string,
  mainGoal: string,
  prevOutlines?: string[],
  pendingClues?: string[]
): Promise<string> => {
  const prompt = [
    `为小说《${bookTitle}》（类型：${bookGenre}）生成后续3章的故事大纲。`,
    `世界观：${worldSetting}`,
    `主线目标：${mainGoal}`,
    ...(prevOutlines && prevOutlines.length > 0 ? [`前置剧情：${prevOutlines.join('; ')}`] : []),
    ...(pendingClues && pendingClues.length > 0 ? [`待处理的伏笔：${pendingClues.join(', ')}`] : []),
    '要求：',
    '- 每章大纲300-500字',
    '- 明确标注登场人物',
    '- 标注需要推进或埋设的伏笔',
    '- 确保章节间的连贯性和悬念递进',
    '- 避免一次性解决过多冲突，为后续情节留白'
  ].join('\n\n')

  return await callAI(prompt)
}

/**
 * 提取章节摘要
 */
export const extractChapterSummary = async (chapterContent: string): Promise<string> => {
  const prompt = [
    '请为以下章节内容生成100-200字的摘要，突出核心情节和关键转折点：',
    chapterContent
  ].join('\n\n')

  return await callAI(prompt)
}

/**
 * 更新人物状态
 */
export const updateCharacterStatus = async (
  chapterContent: string,
  characters: string[]
): Promise<Record<string, string>> => {
  if (characters.length === 0) return {}

  const prompt = [
    `分析以下章节内容中以下人物的状态变化：${characters.join(', ')}`,
    '请为每个人物用一句话描述他们在本章后的新状态（身体、心理、立场等）：',
    chapterContent
  ].join('\n\n')

  const response = await callAI(prompt)

  // 简单解析响应，实际应用中可能需要更复杂的解析
  const result: Record<string, string> = {}
  characters.forEach(char => {
    // 这里是一个简化版本，实际应该解析AI返回的格式化内容
    result[char] = response.includes(char) ? '状态在本章中有所体现' : '状态保持不变'
  })

  return result
}

/**
 * 追踪伏笔
 */
export const trackClues = async (
  chapterContent: string,
  existingClues: string[]
): Promise<{ resolved: string[], newClues: string[] }> => {
  const prompt = [
    '分析以下章节内容：',
    chapterContent,
    '以及现有的伏笔列表：',
    existingClues.join('\n'),
    '请识别：',
    '1. 哪些伏笔在本章中得到了解答或回收',
    '2. 本章产生了哪些新的悬念或伏笔',
    '以JSON格式返回结果：{"resolved": [], "newClues": []}'
  ].join('\n\n')

  try {
    const response = await callAI(prompt)

    // 尝试解析AI返回的JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        resolved: parsed.resolved || [],
        newClues: parsed.newClues || []
      }
    } else {
      // 如果AI未返回有效JSON，返回空结果
      return { resolved: [], newClues: [] }
    }
  } catch (error) {
    console.error('伏笔追踪解析失败:', error)
    return { resolved: [], newClues: [] }
  }
}
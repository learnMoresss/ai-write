// server/api/stories/index.post.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const body = await readBody(event)

  if (!body) {
    throw createError({
      statusCode: 400,
      message: 'Request body is required'
    })
  }

  // 验证必要字段
  if (!body.title) {
    throw createError({
      statusCode: 400,
      message: 'Story title is required'
    })
  }

  try {
    // 生成ID（如果未提供）
    const storyId = body.id || crypto.randomUUID()

    // 创建新故事
    const { data, error } = await client
      .from('stories')
      .insert([{
        id: storyId,
        title: body.title,
        description: body.description || '',
        world_setting: body.worldSetting || {},
        entities: body.entities || [],
        relationships: body.relationships || [],
        plot_events: body.plotEvents || [],
        timeline: body.timeline || [],
        triggers: body.triggers || [],
        status: body.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message
      })
    }

    return {
      data,
      message: 'Story created successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while creating the story'
    })
  }
})
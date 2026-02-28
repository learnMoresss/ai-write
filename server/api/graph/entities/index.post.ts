// server/api/graph/entities/index.post.ts
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
  if (!body.id || !body.label) {
    throw createError({
      statusCode: 400,
      message: 'Entity ID and label are required'
    })
  }

  try {
    // 创建新实体
    const { data, error } = await client
      .from('story_entities')
      .insert([{
        ...body,
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
      message: 'Entity created successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while creating the entity'
    })
  }
})
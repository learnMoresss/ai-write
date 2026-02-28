// server/api/stories/[id].put.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Story ID is required'
    })
  }

  // 验证请求体
  if (!body) {
    throw createError({
      statusCode: 400,
      message: 'Request body is required'
    })
  }

  try {
    // 更新故事
    const { data, error } = await client
      .from('stories')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: error.code === 'NotFound' ? 404 : 500,
        message: error.message
      })
    }

    return {
      data,
      message: 'Story updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while updating the story'
    })
  }
})
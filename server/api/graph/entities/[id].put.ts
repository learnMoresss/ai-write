// server/api/graph/entities/[id].put.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Entity ID is required'
    })
  }

  if (!body) {
    throw createError({
      statusCode: 400,
      message: 'Request body is required'
    })
  }

  try {
    // 更新实体
    const { data, error } = await client
      .from('story_entities')
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
      message: 'Entity updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while updating the entity'
    })
  }
})
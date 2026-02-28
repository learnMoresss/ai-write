// server/api/graph/entities/[id].delete.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Entity ID is required'
    })
  }

  try {
    // 删除实体
    const { error } = await client
      .from('story_entities')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: error.code === 'NotFound' ? 404 : 500,
        message: error.message
      })
    }

    // 同时删除相关的边（关系）
    await client
      .from('story_relationships')
      .delete()
      .or(`source.eq.${id},target.eq.${id}`)

    return {
      message: 'Entity and its relationships deleted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while deleting the entity'
    })
  }
})
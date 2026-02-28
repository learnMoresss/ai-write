// server/api/graph/relations/[id].delete.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Relationship ID is required'
    })
  }

  try {
    // 删除关系
    const { error } = await client
      .from('story_relationships')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: error.code === 'NotFound' ? 404 : 500,
        message: error.message
      })
    }

    return {
      message: 'Relationship deleted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while deleting the relationship'
    })
  }
})
// server/api/stories/[id].delete.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Story ID is required'
    })
  }

  try {
    // 删除故事
    const { error } = await client
      .from('stories')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: error.code === 'NotFound' ? 404 : 500,
        message: error.message
      })
    }

    return {
      message: 'Story deleted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while deleting the story'
    })
  }
})
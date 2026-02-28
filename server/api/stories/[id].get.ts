// server/api/stories/[id].get.ts
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
    // 从Supabase获取特定故事
    const { data, error } = await client
      .from('stories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw createError({
        statusCode: error.code === 'NotFound' ? 404 : 500,
        message: error.message
      })
    }

    return {
      data,
      message: 'Story retrieved successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while retrieving the story'
    })
  }
})
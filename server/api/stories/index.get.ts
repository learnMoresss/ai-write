// server/api/stories/index.get.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)

  try {
    // 从Supabase获取用户的所有故事
    const { data, error } = await client
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message
      })
    }

    return {
      data: data || [],
      message: 'Stories retrieved successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'An error occurred while retrieving stories'
    })
  }
})
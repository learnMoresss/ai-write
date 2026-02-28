// server/api/graph/entities/index.get.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)

  try {
    // 获取所有实体（节点）
    const { data: nodes, error: nodesError } = await client
      .from('story_entities')
      .select('*')
      .order('created_at', { ascending: false })

    if (nodesError) {
      throw createError({
        statusCode: 500,
        message: nodesError.message
      })
    }

    // 获取所有关系（边）
    const { data: edges, error: edgesError } = await client
      .from('story_relationships')
      .select('*')
      .order('created_at', { ascending: false })

    if (edgesError) {
      throw createError({
        statusCode: 500,
        message: edgesError.message
      })
    }

    return {
      data: {
        nodes: nodes || [],
        edges: edges || []
      },
      message: 'Graph entities retrieved successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'An error occurred while retrieving graph entities'
    })
  }
})
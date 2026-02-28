// server/api/graph/relations/index.post.ts
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
  if (!body.id || !body.source || !body.target || !body.relation) {
    throw createError({
      statusCode: 400,
      message: 'Relation ID, source, target, and relation type are required'
    })
  }

  try {
    // 检查源和目标节点是否存在
    const { error: sourceError } = await client
      .from('story_entities')
      .select('id')
      .eq('id', body.source)
      .single()

    if (sourceError) {
      throw createError({
        statusCode: 400,
        message: `Source entity ${body.source} does not exist`
      })
    }

    const { error: targetError } = await client
      .from('story_entities')
      .select('id')
      .eq('id', body.target)
      .single()

    if (targetError) {
      throw createError({
        statusCode: 400,
        message: `Target entity ${body.target} does not exist`
      })
    }

    // 创建新关系
    const { data, error } = await client
      .from('story_relationships')
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
      message: 'Relationship created successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An error occurred while creating the relationship'
    })
  }
})
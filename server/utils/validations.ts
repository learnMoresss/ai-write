// server/utils/validations.ts
import { z } from 'zod'

export const worldSettingSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, '世界观名称不能为空'),
  description: z.string().min(10, '世界观描述至少需要10个字符'),
  geography: z.string().optional(),
  politicalSystem: z.string().optional(),
  cultivationSystem: z.string().optional(),
  magicSystem: z.string().optional(),
  technologyLevel: z.string().optional(),
  economicSystem: z.string().optional(),
  culturalBackground: z.string().optional(),
  lawsOfNature: z.string().optional(),
  uniqueFeatures: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const entityNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['character', 'location', 'item', 'organization', 'event']),
  label: z.string().min(1, '节点标签不能为空'),
  properties: z.record(z.unknown()).optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  category: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const entityEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relation: z.string().min(1, '关系类型不能为空'),
  weight: z.number().min(0).max(100),
  properties: z.record(z.unknown()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const storySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  worldSetting: worldSettingSchema.optional(),
  entities: z.array(entityNodeSchema).optional(),
  relationships: z.array(entityEdgeSchema).optional(),
  plotEvents: z.array(z.unknown()).optional(),
  timeline: z.array(z.unknown()).optional(),
  triggers: z.array(z.unknown()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  status: z.enum(['draft', 'in-progress', 'completed', 'archived']).default('draft')
})

export const validateWithZod = <T>(schema: z.Schema<T>, data: unknown): T => {
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    const errors = parsed.error.issues.map(issue =>
      `${issue.path.join('.')}: ${issue.message}`
    )
    throw new Error(`Validation failed: ${errors.join(', ')}`)
  }

  return parsed.data
}
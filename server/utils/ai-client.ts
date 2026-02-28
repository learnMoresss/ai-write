// server/utils/ai-client.ts
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createMistral } from '@ai-sdk/mistral'

export const getAIProvider = (provider: string, apiKey: string) => {
  switch (provider) {
    case 'openai':
      return createOpenAI({
        apiKey
      })
    case 'anthropic':
      return createAnthropic({
        apiKey
      })
    case 'google':
      return createGoogleGenerativeAI({
        apiKey
      })
    case 'mistral':
      return createMistral({
        apiKey
      })
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}

export const getModel = (provider: string, modelName: string, apiKey: string) => {
  const aiProvider = getAIProvider(provider, apiKey)

  return aiProvider(modelName)
}
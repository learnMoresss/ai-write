/** 与 server/utils/api-response.ts 保持一致：成功 data 有值、err 为 null；失败 code 非 200、data 为 null、err 为字符串 */
export type ApiEnvelope<T> = {
  code: number
  msg: string
  data: T | null
  err: string | null
}

const unwrap = <T>(response: ApiEnvelope<T>): T => {
  if (response.code === 200 && response.data !== null) {
    return response.data
  }
  const errorMessage = response.err ?? response.msg ?? 'Request failed'
  throw new Error(errorMessage)
}

export const apiGet = async <T>(url: string): Promise<T> => {
  const response = await $fetch<ApiEnvelope<T>>(url)
  return unwrap(response)
}

export const apiPost = async <T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<T> => {
  const response = await $fetch<ApiEnvelope<T>>(url, {
    method: 'POST',
    body: body as BodyInit | Record<string, unknown> | null | undefined,
    headers
  })
  return unwrap(response)
}

export const apiPut = async <T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<T> => {
  const response = await $fetch<ApiEnvelope<T>>(url, {
    method: 'PUT',
    body: body as BodyInit | Record<string, unknown> | null | undefined,
    headers
  })
  return unwrap(response)
}

export const apiDelete = async <T>(url: string, headers?: Record<string, string>): Promise<T> => {
  const response = await $fetch<ApiEnvelope<T>>(url, {
    method: 'DELETE',
    headers
  })
  return unwrap(response)
}

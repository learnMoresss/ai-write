/**
 * 统一 API 响应格式
 * - 所有接口 HTTP 状态码均为 200，通过 body.code 区分成功/失败
 * - 成功: { code: 200, msg: string, data: T }
 * - 失败: { code: 4xx|5xx, msg: string, err?: string }
 */

export type ApiSuccessBody<T> = {
  code: 200
  msg: string
  data: T
  err: null
}

export type ApiErrorBody = {
  code: number
  msg: string
  data: null
  err: string
}

export type ApiEnvelope<T> = ApiSuccessBody<T> | ApiErrorBody

/** 成功响应 */
export function apiSuccess<T>(data: T, msg: string = 'success'): ApiSuccessBody<T> {
  return { code: 200, msg, data, err: null }
}

/** 错误响应，code 建议 400/404/500 */
export function apiError(code: number, msg: string, err?: string): ApiErrorBody {
  return { code, msg, data: null, err: err ?? msg }
}

/** 在 handler 内用 try/catch 包一层，捕获异常并返回标准错误体；否则直接 return apiSuccess(...) */
export function withApiResponse<T>(fn: () => Promise<T>, errorCode: number = 500): Promise<ApiEnvelope<T>> {
  return fn()
    .then((data) => apiSuccess(data))
    .catch((e: Error) => apiError(errorCode, e.message ?? '服务器错误', e.message ?? undefined))
}

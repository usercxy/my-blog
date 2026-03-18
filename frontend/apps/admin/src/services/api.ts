interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

interface RequestOptions {
  body?: unknown
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | undefined>
  token?: string
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api'

const getApiBaseUrl = () => (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '')

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    url.searchParams.set(key, String(value))
  })

  return url.toString()
}

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok || !payload || payload.code !== 0) {
    throw new Error(payload?.message || `请求失败（${response.status}）`)
  }

  return payload.data
}

export const apiGet = <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
  request<T>(path, options)

export const apiPost = <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
  request<T>(path, {
    ...options,
    method: 'POST',
    body,
  })

export const apiPut = <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
  request<T>(path, {
    ...options,
    method: 'PUT',
    body,
  })

export const apiDelete = <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
  request<T>(path, {
    ...options,
    method: 'DELETE',
  })

export const getApiErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '请求失败，请稍后重试。'

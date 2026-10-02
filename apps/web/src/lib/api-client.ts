const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  const hasBody = options.body !== undefined

  if (hasBody && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    body:
      options.body instanceof FormData
        ? options.body
        : hasBody
          ? JSON.stringify(options.body)
          : undefined,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const details = await parseResponse(response)
    throw new ApiError(
      getErrorMessage(details) ?? 'The request could not be completed.',
      response.status,
      details,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await parseResponse(response)) as T
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

function getErrorMessage(details: unknown): string | undefined {
  if (typeof details !== 'object' || details === null || !('message' in details)) {
    return undefined
  }

  const { message } = details

  return Array.isArray(message) ? message.join(', ') : String(message)
}

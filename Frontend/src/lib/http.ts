export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

function envEnabled(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === '') return fallback
  return value === 'true' || value === '1'
}

export const API_FEATURES = {
  orders: envEnabled(import.meta.env.VITE_ENABLE_ORDERS_API, false),
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function unwrapData<T>(payload: unknown): T {
  if (isRecord(payload) && 'data' in payload) {
    return payload.data as T
  }

  return payload as T
}

export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (isRecord(payload) && Array.isArray(payload.data)) {
    return payload.data as T[]
  }

  if (
    isRecord(payload) &&
    isRecord(payload.data) &&
    Array.isArray(payload.data.data)
  ) {
    return payload.data.data as T[]
  }

  return []
}

export function unwrapUser<T extends object>(payload: unknown): T | null {
  // Handles:
  // { data: { id: ... } }
  // { id: ... }
  // { data: { data: { id: ... } } }
  const fromRecord = unwrapRecord<T>(payload)

  if (fromRecord) {
    return fromRecord
  }

  // Handles registration responses such as:
  // {
  //   user: {
  //     id: 4,
  //     name: "...",
  //     ...
  //   },
  //   temporary_password: "..."
  // }
  if (
    isRecord(payload) &&
    isRecord(payload.user) &&
    'id' in payload.user
  ) {
    return payload.user as T
  }

  // Handles:
  // {
  //   user: {
  //     data: {
  //       id: ...
  //     }
  //   }
  // }
  if (
    isRecord(payload) &&
    isRecord(payload.user) &&
    isRecord(payload.user.data) &&
    'id' in payload.user.data
  ) {
    return payload.user.data as T
  }

  // Handles authentication responses that contain:
  // {
  //   user: {...},
  //   access_token: "..."
  // }
  try {
    const auth = extractAuthPayload(payload)

    if (isRecord(auth.user) && 'id' in auth.user) {
      return auth.user as T
    }

    if (
      isRecord(auth.user) &&
      isRecord(auth.user.data) &&
      'id' in auth.user.data
    ) {
      return auth.user.data as T
    }
  } catch {
    return null
  }

  return null
}

export function unwrapRecord<T extends object>(payload: unknown): T | null {
  if (
    isRecord(payload) &&
    isRecord(payload.data) &&
    'id' in payload.data
  ) {
    return payload.data as T
  }

  if (isRecord(payload) && 'id' in payload) {
    return payload as T
  }

  if (
    isRecord(payload) &&
    isRecord(payload.data) &&
    isRecord(payload.data.data) &&
    'id' in payload.data.data
  ) {
    return payload.data.data as T
  }

  return null
}

export function unwrapPaginated<T>(payload: unknown): {
  items: T[]
  currentPage: number
  lastPage: number
} {
  const items = unwrapList<T>(payload)

  const meta =
    isRecord(payload) && isRecord(payload.meta)
      ? payload.meta
      : isRecord(payload)
        ? payload
        : {}

  return {
    items,
    currentPage: Number(meta.current_page ?? 1) || 1,
    lastPage: Number(meta.last_page ?? 1) || 1,
  }
}

export function extractAuthPayload(payload: unknown): {
  user: unknown
  access_token: string
  token_type?: string
  expires_at?: string
} {
  const root = isRecord(payload) ? payload : {}

  const nested = isRecord(root.data) ? root.data : root

  const source =
    isRecord(nested) && 'access_token' in nested
      ? nested
      : root

  const token =
    typeof source.access_token === 'string'
      ? source.access_token
      : ''

  const user = source.user

  if (!token || user == null) {
    throw new Error(
      'Authentication response was missing a user or access token.',
    )
  }

  return {
    user,
    access_token: token,
    token_type:
      typeof source.token_type === 'string'
        ? source.token_type
        : undefined,
    expires_at:
      typeof source.expires_at === 'string'
        ? source.expires_at
        : undefined,
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (
    isRecord(error) &&
    isRecord(error.response) &&
    isRecord(error.response.data)
  ) {
    const data = error.response.data

    if (
      typeof data.message === 'string' &&
      data.message.trim()
    ) {
      return data.message
    }

    if (isRecord(data.errors)) {
      const first = Object.values(data.errors).flat()[0]

      if (
        typeof first === 'string' &&
        first.trim()
      ) {
        return first
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function isAuthRequestUrl(
  url: string | undefined,
): boolean {
  if (!url) return false

  return (
    url.includes('/login') ||
    url.includes('/register')
  )
}

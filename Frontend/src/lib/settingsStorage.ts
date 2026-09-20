import type { AdminSettingsState } from '@/types/Settings'
import { DEFAULT_ADMIN_SETTINGS } from '@/types/Settings'
import { toast } from 'sonner'

const STORAGE_KEY = 'admin-settings-cache'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function loadAdminSettings(): AdminSettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_ADMIN_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AdminSettingsState>
    if (!isRecord(parsed)) return DEFAULT_ADMIN_SETTINGS

    return {
      platform: { ...DEFAULT_ADMIN_SETTINGS.platform, ...parsed.platform },
      notifications: { ...DEFAULT_ADMIN_SETTINGS.notifications, ...parsed.notifications },
      privacy: { ...DEFAULT_ADMIN_SETTINGS.privacy, ...parsed.privacy },
      system: { ...DEFAULT_ADMIN_SETTINGS.system, ...parsed.system },
      language: parsed.language ?? DEFAULT_ADMIN_SETTINGS.language,
    }
  } catch {
    return DEFAULT_ADMIN_SETTINGS
  }
}

export function saveAdminSettings(settings: AdminSettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to cache settings:', error)
  }
}

export function clearSettingsCache() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear settings cache:', error)
  }
}

export async function loadAdminSettingsFromApi(): Promise<AdminSettingsState> {
  return loadAdminSettings()
}

export async function saveAdminSettingsToApi(settings: AdminSettingsState): Promise<AdminSettingsState> {
  saveAdminSettings(settings)
  return settings
}

export async function saveSettingsSection<T extends keyof AdminSettingsState>(
  section: T,
  data: AdminSettingsState[T],
): Promise<AdminSettingsState[T]> {
  saveAdminSettings({
    ...loadAdminSettings(),
    [section]: data,
  })
  return data
}

export function getSettingValue<K extends keyof AdminSettingsState>(
  settings: AdminSettingsState,
  key: K,
): AdminSettingsState[K] {
  return settings[key]
}

export function updateSettingValue<K extends keyof AdminSettingsState>(
  settings: AdminSettingsState,
  key: K,
  value: AdminSettingsState[K],
): AdminSettingsState {
  return {
    ...settings,
    [key]: value,
  }
}

export function updateNestedSetting<T>(
  settings: AdminSettingsState,
  path: string[],
  value: T,
): AdminSettingsState {
  const newSettings = { ...settings }
  let current: Record<string, unknown> = newSettings as unknown as Record<string, unknown>

  for (let i = 0; i < path.length - 1; i++) {
    const next = current[path[i]]
    if (!isRecord(next)) return settings
    current = next
  }

  current[path[path.length - 1]] = value
  return newSettings
}

export function validateSettings(settings: AdminSettingsState): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!settings.platform.platformName.trim()) {
    errors.push('Platform name is required')
  }
  if (!settings.platform.supportEmail.trim()) {
    errors.push('Support email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.platform.supportEmail)) {
    errors.push('Support email is invalid')
  }
  if (settings.platform.defaultDeliveryFee < 0) {
    errors.push('Default delivery fee cannot be negative')
  }
  if (settings.platform.minimumOrderAmount < 0) {
    errors.push('Minimum order amount cannot be negative')
  }

  if (settings.privacy.sessionTimeoutMinutes < 15 || settings.privacy.sessionTimeoutMinutes > 120) {
    errors.push('Session timeout must be between 15 and 120 minutes')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export async function saveAllSettingsWithValidation(data: {
  profile: { name: string; email: string; phone: string }
  settings: AdminSettingsState
}) {
  const validation = validateSettings(data.settings)
  if (!validation.isValid) {
    validation.errors.forEach((error) => toast.warning(error))
    throw new Error('Validation failed')
  }

  if (!data.profile.name?.trim()) {
    const error = new Error('Name is required')
    toast.warning(error.message)
    throw error
  }
  if (!data.profile.email?.trim()) {
    const error = new Error('Email is required')
    toast.warning(error.message)
    throw error
  }

  saveAdminSettings(data.settings)
  return data.settings
}

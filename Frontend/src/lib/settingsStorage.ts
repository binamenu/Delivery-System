import type { AdminSettingsState } from '@/types/Settings'
import { DEFAULT_ADMIN_SETTINGS } from '@/types/Settings'

const STORAGE_KEY = 'admin-settings'

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

import api from '@/lib/api'
import { loadAdminSettings, saveAdminSettings } from '@/lib/settingsStorage'
import type {
  AdminPasswordForm,
  AdminProfileForm,
  AdminSettingsState,
  AdminPlatformSettings,
  AdminNotificationSettings,
  AdminPrivacySettings,
  AdminSystemControls,
  AdminLanguage,
} from '@/types/Settings'

function persistSection<K extends keyof AdminSettingsState>(
  key: K,
  value: AdminSettingsState[K],
): AdminSettingsState[K] {
  const current = loadAdminSettings()
  const next = { ...current, [key]: value }
  saveAdminSettings(next)
  return value
}

export async function updateAdminPassword(form: AdminPasswordForm) {
  if (form.newPassword !== form.confirmPassword) {
    throw new Error('New password and confirm password do not match')
  }

  if (form.newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  await api.put('/change-password', {
    current_password: form.currentPassword,
    password: form.newPassword,
    password_confirmation: form.confirmPassword,
  })
}

export async function updateAdminProfile(_form: AdminProfileForm) {
  return _form
}

export async function updateTwoFactorStatus(enabled: boolean) {
  persistSection('privacy', {
    ...loadAdminSettings().privacy,
    twoFactorEnabled: enabled,
  })
  return { enabled }
}

export async function updateSessionTimeout(minutes: number) {
  persistSection('privacy', {
    ...loadAdminSettings().privacy,
    sessionTimeoutMinutes: minutes as AdminSettingsState['privacy']['sessionTimeoutMinutes'],
  })
  return { sessionTimeoutMinutes: minutes }
}

export async function updatePrivacySettings(privacy: AdminPrivacySettings) {
  return persistSection('privacy', privacy)
}

export async function updatePlatformSettings(platform: AdminPlatformSettings) {
  return persistSection('platform', platform)
}

export async function updateNotificationSettings(notifications: AdminNotificationSettings) {
  return persistSection('notifications', notifications)
}

export async function updateSystemControls(system: AdminSystemControls) {
  return persistSection('system', system)
}

export async function updateLanguage(language: AdminLanguage) {
  return persistSection('language', language)
}

export async function fetchSettings(): Promise<AdminSettingsState> {
  return loadAdminSettings()
}

export async function saveAllSettings(data: {
  profile: AdminProfileForm
  settings: AdminSettingsState
}) {
  saveAdminSettings(data.settings)
  return data.settings
}

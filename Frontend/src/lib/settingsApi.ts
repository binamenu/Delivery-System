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

export async function updateAdminPassword(form: AdminPasswordForm) {
  if (form.newPassword !== form.confirmPassword) {
    throw new Error('New password and confirm password do not match')
  }
  if (form.newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }
  throw new Error('Password change is not available yet. Backend support is pending.')
}

export async function updateAdminProfile(form: AdminProfileForm) {
  if (!form.name || !form.name.trim()) {
    throw new Error('Name is required')
  }
  if (!form.email || !form.email.trim()) {
    throw new Error('Email is required')
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    throw new Error('Please enter a valid email address')
  }
  throw new Error('Profile update is not available yet. Backend support is pending.')
}

export async function updateTwoFactorStatus(enabled: boolean) {
  throw new Error('Two-factor authentication is not available yet. Backend support is pending.')
}

export async function updateSessionTimeout(minutes: number) {
  throw new Error('Session timeout update is not available yet. Backend support is pending.')
}

export async function updatePrivacySettings(privacy: AdminPrivacySettings) {
  throw new Error('Privacy settings update is not available yet. Backend support is pending.')
}

export async function updatePlatformSettings(platform: AdminPlatformSettings) {
  throw new Error('Platform settings update is not available yet. Backend support is pending.')
}

export async function updateNotificationSettings(notifications: AdminNotificationSettings) {
  throw new Error('Notification settings update is not available yet. Backend support is pending.')
}

export async function updateSystemControls(system: AdminSystemControls) {
  throw new Error('System controls update is not available yet. Backend support is pending.')
}

export async function updateLanguage(language: AdminLanguage) {
  throw new Error('Language update is not available yet. Backend support is pending.')
}

export async function fetchSettings(): Promise<AdminSettingsState> {
  throw new Error('Settings are not available yet. Backend support is pending.')
}

export async function saveAllSettings(data: {
  profile: AdminProfileForm
  settings: AdminSettingsState
}) {
  if (!data.profile.name || !data.profile.name.trim()) {
    throw new Error('Name is required')
  }
  if (!data.profile.email || !data.profile.email.trim()) {
    throw new Error('Email is required')
  }
  throw new Error('Settings save is not available yet. Backend support is pending.')
}
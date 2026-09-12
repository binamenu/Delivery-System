export async function updateAdminPassword(form: { newPassword: string; confirmPassword: string }) {
  if (form.newPassword !== form.confirmPassword) {
    throw new Error('New password and confirm password do not match')
  }
  if (form.newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }
  throw new Error('Password change is not available yet. Backend support is pending.')
}

export async function updateAdminProfile(form: { name: string; email: string }) {
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

export async function updateTwoFactorStatus(_enabled: boolean) {
  throw new Error('Two-factor authentication is not available yet. Backend support is pending.')
}

export async function updateSessionTimeout(_minutes: number) {
  throw new Error('Session timeout update is not available yet. Backend support is pending.')
}

export async function updatePrivacySettings(_privacy: unknown) {
  throw new Error('Privacy settings update is not available yet. Backend support is pending.')
}

export async function updatePlatformSettings(_platform: unknown) {
  throw new Error('Platform settings update is not available yet. Backend support is pending.')
}

export async function updateNotificationSettings(_notifications: unknown) {
  throw new Error('Notification settings update is not available yet. Backend support is pending.')
}

export async function updateSystemControls(_system: unknown) {
  throw new Error('System controls update is not available yet. Backend support is pending.')
}

export async function updateLanguage(_language: string) {
  throw new Error('Language update is not available yet. Backend support is pending.')
}

export async function fetchSettings(): Promise<never> {
  throw new Error('Settings are not available yet. Backend support is pending.')
}

export async function saveAllSettings(data: {
  profile: { name: string; email: string }
}) {
  if (!data.profile.name || !data.profile.name.trim()) {
    throw new Error('Name is required')
  }
  if (!data.profile.email || !data.profile.email.trim()) {
    throw new Error('Email is required')
  }
  throw new Error('Settings save is not available yet. Backend support is pending.')
}
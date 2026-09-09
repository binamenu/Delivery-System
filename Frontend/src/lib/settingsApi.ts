import api from '@/lib/api'
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

const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors
    if (Array.isArray(errors)) {
      return errors.map((e: any) => e.message || e).join(', ')
    }
    return Object.values(errors).flat().join(', ')
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export async function updateAdminPassword(form: AdminPasswordForm) {
  if (form.newPassword !== form.confirmPassword) {
    throw new Error('New password and confirm password do not match')
  }
  if (form.newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }
  try {
    const response = await api.put('/change-password', {
      currentPassword: form.currentPassword,
      password: form.newPassword,
      passwordConfirmation: form.confirmPassword,
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
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
  try {
    const response = await api.put('/profile', {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone ? form.phone.trim() : '',
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
}

export async function updateTwoFactorStatus(enabled: boolean) {
  try {
    const response = await api.put('/settings/2fa', {
      enabled,
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
}

export async function updateSessionTimeout(minutes: number) {
  try {
    const response = await api.put('/settings/session-timeout', {
      sessionTimeoutMinutes: minutes,
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
}

export async function updatePrivacySettings(privacy: AdminPrivacySettings) {
  try {
    const response = await api.put('/settings/privacy', {
      sessionTimeoutMinutes: privacy.sessionTimeoutMinutes,
      twoFactorEnabled: privacy.twoFactorEnabled,
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
}

export async function updatePlatformSettings(platform: AdminPlatformSettings) {
  try {
    const response = await api.put('/settings/platform', {
      platformName: platform.platformName,
      supportEmail: platform.supportEmail,
      supportPhone: platform.supportPhone,
      currency: platform.currency,
      defaultDeliveryFee: platform.defaultDeliveryFee,
      minimumOrderAmount: platform.minimumOrderAmount,
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
}

export async function updateNotificationSettings(notifications: AdminNotificationSettings) {
  try {
    const response = await api.put('/settings/notifications', {
      newRestaurantRegistration: notifications.newRestaurantRegistration,
      restaurantApprovalRequests: notifications.restaurantApprovalRequests,
      newOrders: notifications.newOrders,
      deliveryUpdates: notifications.deliveryUpdates,
      systemAlerts: notifications.systemAlerts,
      dailyPlatformSummary: notifications.dailyPlatformSummary,
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
}

export async function updateSystemControls(system: AdminSystemControls) {
  try {
    const response = await api.put('/settings/system', {
      allowRestaurantRegistrations: system.allowRestaurantRegistrations,
      allowUserRegistrations: system.allowUserRegistrations,
      maintenanceMode: system.maintenanceMode,
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
}

export async function updateLanguage(language: AdminLanguage) {
  try {
    const response = await api.put('/settings/language', {
      language,
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
}

export async function fetchSettings(): Promise<AdminSettingsState> {
  try {
    const response = await api.get('/settings')
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
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

  try {
    const response = await api.put('/settings/all', {
      profile: {
        name: data.profile.name.trim(),
        email: data.profile.email.trim(),
        phone: data.profile.phone?.trim() || '',
      },
      settings: {
        platform: {
          platformName: data.settings.platform.platformName,
          supportEmail: data.settings.platform.supportEmail,
          supportPhone: data.settings.platform.supportPhone,
          currency: data.settings.platform.currency,
          defaultDeliveryFee: data.settings.platform.defaultDeliveryFee,
          minimumOrderAmount: data.settings.platform.minimumOrderAmount,
        },
        notifications: {
          newRestaurantRegistration: data.settings.notifications.newRestaurantRegistration,
          restaurantApprovalRequests: data.settings.notifications.restaurantApprovalRequests,
          newOrders: data.settings.notifications.newOrders,
          deliveryUpdates: data.settings.notifications.deliveryUpdates,
          systemAlerts: data.settings.notifications.systemAlerts,
          dailyPlatformSummary: data.settings.notifications.dailyPlatformSummary,
        },
        privacy: {
          sessionTimeoutMinutes: data.settings.privacy.sessionTimeoutMinutes,
          twoFactorEnabled: data.settings.privacy.twoFactorEnabled,
        },
        system: {
          allowRestaurantRegistrations: data.settings.system.allowRestaurantRegistrations,
          allowUserRegistrations: data.settings.system.allowUserRegistrations,
          maintenanceMode: data.settings.system.maintenanceMode,
        },
        language: data.settings.language,
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleApiError(error))
  }
}
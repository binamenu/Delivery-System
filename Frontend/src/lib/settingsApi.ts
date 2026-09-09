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
import { toast } from 'sonner'

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
    const error = new Error('New password and confirm password do not match')
    toast.warning(error.message)
    throw error
  }

  if (form.newPassword.length < 8) {
    const error = new Error('Password must be at least 8 characters long')
    toast.warning(error.message)
    throw error
  }

  try {
    const response = await api.put('/change-password', {
      currentPassword: form.currentPassword,
      password: form.newPassword,
      passwordConfirmation: form.confirmPassword,
    })
    
    toast.success('Password updated successfully')
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(errorMessage)
    console.error('Password update error:', error)
    throw error
  }
}

export async function updateAdminProfile(form: AdminProfileForm) {

  if (!form.name || !form.name.trim()) {
    const error = new Error('Name is required')
    toast.warning(error.message)
    throw error
  }

  if (!form.email || !form.email.trim()) {
    const error = new Error('Email is required')
    toast.warning(error.message)
    throw error
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    const error = new Error('Please enter a valid email address')
    toast.warning(error.message)
    throw error
  }

  try {
    const response = await api.put('/profile', {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone ? form.phone.trim() : '', // Include phone even if empty
    })
    
    toast.success('Profile updated successfully')
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(errorMessage)
    console.error('Profile update error:', error)
    throw error
  }
}

export async function updateTwoFactorStatus(enabled: boolean) {
  try {
    const response = await api.put('/settings/2fa', {
      enabled,
    })
    
    toast.success(`2FA ${enabled ? 'enabled' : 'disabled'} successfully`)
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to update 2FA: ${errorMessage}`)
    console.error('2FA update error:', error)
    throw error
  }
}

export async function updateSessionTimeout(minutes: number) {
  try {
    const response = await api.put('/settings/session-timeout', {
      sessionTimeoutMinutes: minutes,
    })
    
    toast.success(`Session timeout set to ${minutes} minutes`)
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to update session timeout: ${errorMessage}`)
    console.error('Session timeout update error:', error)
    throw error
  }
}

export async function updatePrivacySettings(privacy: AdminPrivacySettings) {
  try {
    const response = await api.put('/settings/privacy', {
      sessionTimeoutMinutes: privacy.sessionTimeoutMinutes,
      twoFactorEnabled: privacy.twoFactorEnabled,
    })
    
    toast.success('Privacy settings updated successfully')
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to update privacy settings: ${errorMessage}`)
    console.error('Privacy settings update error:', error)
    throw error
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
    
    toast.success('Platform settings updated successfully')
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to update platform settings: ${errorMessage}`)
    console.error('Platform settings update error:', error)
    throw error
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
    
    toast.success('Notification settings updated successfully')
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to update notification settings: ${errorMessage}`)
    console.error('Notification settings update error:', error)
    throw error
  }
}

export async function updateSystemControls(system: AdminSystemControls) {
  try {
    const response = await api.put('/settings/system', {
      allowRestaurantRegistrations: system.allowRestaurantRegistrations,
      allowUserRegistrations: system.allowUserRegistrations,
      maintenanceMode: system.maintenanceMode,
    })
    
    toast.success('System controls updated successfully')
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to update system controls: ${errorMessage}`)
    console.error('System controls update error:', error)
    throw error
  }
}

export async function updateLanguage(language: AdminLanguage) {
  try {
    const response = await api.put('/settings/language', {
      language,
    })
    
    toast.success('Language updated successfully')
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to update language: ${errorMessage}`)
    console.error('Language update error:', error)
    throw error
  }
}

export async function fetchSettings(): Promise<AdminSettingsState> {
  try {
    const response = await api.get('/settings')
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to fetch settings: ${errorMessage}`)
    console.error('Fetch settings error:', error)
    throw error
  }
}

export async function saveAllSettings(data: {
  profile: AdminProfileForm
  settings: AdminSettingsState
}) {
  try {
    if (!data.profile.name || !data.profile.name.trim()) {
      const error = new Error('Name is required')
      toast.warning(error.message)
      throw error
    }
    if (!data.profile.email || !data.profile.email.trim()) {
      const error = new Error('Email is required')
      toast.warning(error.message)
      throw error
    }

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
    
    toast.success('All settings saved successfully')
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to save settings: ${errorMessage}`)
    console.error('Save all settings error:', error)
    throw error
  }
}
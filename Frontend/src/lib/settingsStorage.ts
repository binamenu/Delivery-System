import type { AdminSettingsState } from '@/types/Settings'
import { DEFAULT_ADMIN_SETTINGS } from '@/types/Settings'
import { toast } from 'sonner'
import api from '@/lib/api'

const STORAGE_KEY = 'admin-settings-cache'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

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
  try {
    const response = await api.get('/settings')
    
    if (response.data) {
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data))
      } catch (cacheError) {
        console.warn('Failed to cache settings:', cacheError)
      }
      return response.data
    }
    
    return loadAdminSettings()
  } catch (apiError) {
    console.warn('Failed to fetch settings from API, using cache:', apiError)
    
    try {
      const cached = loadAdminSettings()
      return cached
    } catch (cacheError) {
      console.warn('Failed to load from cache, using defaults:', cacheError)
      return DEFAULT_ADMIN_SETTINGS
    }
  }
}

export async function saveAdminSettingsToApi(settings: AdminSettingsState): Promise<AdminSettingsState> {
  try {
    const response = await api.put('/settings', {
      platform: {
        platformName: settings.platform.platformName,
        supportEmail: settings.platform.supportEmail,
        supportPhone: settings.platform.supportPhone,
        currency: settings.platform.currency,
        defaultDeliveryFee: settings.platform.defaultDeliveryFee,
        minimumOrderAmount: settings.platform.minimumOrderAmount,
      },
      notifications: {
        newRestaurantRegistration: settings.notifications.newRestaurantRegistration,
        restaurantApprovalRequests: settings.notifications.restaurantApprovalRequests,
        newOrders: settings.notifications.newOrders,
        deliveryUpdates: settings.notifications.deliveryUpdates,
        systemAlerts: settings.notifications.systemAlerts,
        dailyPlatformSummary: settings.notifications.dailyPlatformSummary,
      },
      privacy: {
        sessionTimeoutMinutes: settings.privacy.sessionTimeoutMinutes,
        twoFactorEnabled: settings.privacy.twoFactorEnabled,
      },
      system: {
        allowRestaurantRegistrations: settings.system.allowRestaurantRegistrations,
        allowUserRegistrations: settings.system.allowUserRegistrations,
        maintenanceMode: settings.system.maintenanceMode,
      },
      language: settings.language,
    })
    
    if (response.data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data))
      } catch (cacheError) {
        console.warn('Failed to cache settings:', cacheError)
      }
      
      toast.success('Settings saved successfully')
      return response.data
    }
    
    throw new Error('No data returned from API')
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to save settings: ${errorMessage}`)
    console.error('Save settings error:', error)
    throw error
  }
}

export async function saveSettingsSection<T extends keyof AdminSettingsState>(
  section: T,
  data: AdminSettingsState[T]
): Promise<AdminSettingsState[T]> {
  try {
    const response = await api.put(`/settings/${section}`, data)
    
    if (response.data) {
    
      try {
        const currentCache = loadAdminSettings()
        const updatedCache = {
          ...currentCache,
          [section]: response.data,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCache))
      } catch (cacheError) {
        console.warn('Failed to cache settings:', cacheError)
      }
      
      toast.success(`${section} settings updated successfully`)
      return response.data
    }
    
    throw new Error('No data returned from API')
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to update ${section}: ${errorMessage}`)
    console.error(`Save ${section} error:`, error)
    throw error
  }
}

export function getSettingValue<K extends keyof AdminSettingsState>(
  settings: AdminSettingsState,
  key: K
): AdminSettingsState[K] {
  return settings[key]
}

export function updateSettingValue<K extends keyof AdminSettingsState>(
  settings: AdminSettingsState,
  key: K,
  value: AdminSettingsState[K]
): AdminSettingsState {
  return {
    ...settings,
    [key]: value,
  }
}

export function updateNestedSetting<T>(
  settings: AdminSettingsState,
  path: string[],
  value: T
): AdminSettingsState {
  const newSettings = { ...settings }
  let current: any = newSettings
  
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]]
    if (!current) return settings
  }
  
  const lastKey = path[path.length - 1]
  current[lastKey] = value
  
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
    validation.errors.forEach(error => toast.warning(error))
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
    
    
    saveAdminSettings(data.settings)
    toast.success('All settings saved successfully')
    return response.data
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    toast.error(`Failed to save settings: ${errorMessage}`)
    console.error('Save all settings error:', error)
    throw error
  }
}
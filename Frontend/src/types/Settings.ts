export type AdminThemePreference = 'light' | 'dark' | 'system'
export type AdminLanguage = 'en' | 'am'
export type AdminCurrency = 'ETB' | 'USD' | 'EUR'

export interface AdminProfileForm {
  name: string
  email: string
  phone: string
}

export interface AdminPasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AdminPlatformSettings {
  platformName: string
  supportEmail: string
  supportPhone: string
  currency: AdminCurrency
  defaultDeliveryFee: number
  minimumOrderAmount: number
}

export interface AdminNotificationSettings {
  newRestaurantRegistration: boolean
  restaurantApprovalRequests: boolean
  newOrders: boolean
  deliveryUpdates: boolean
  systemAlerts: boolean
  dailyPlatformSummary: boolean
}

export interface AdminPrivacySettings {
  sessionTimeoutMinutes: 15 | 30 | 60
  twoFactorEnabled: boolean
}

export interface AdminSystemControls {
  allowRestaurantRegistrations: boolean
  allowUserRegistrations: boolean
  maintenanceMode: boolean
}

export interface AdminSettingsState {
  platform: AdminPlatformSettings
  notifications: AdminNotificationSettings
  privacy: AdminPrivacySettings
  system: AdminSystemControls
  language: AdminLanguage
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsState = {
  platform: {
    platformName: '',
    supportEmail: '',
    supportPhone: '',
    currency: 'ETB',
    defaultDeliveryFee: 0,
    minimumOrderAmount: 0,
  },
  notifications: {
    newRestaurantRegistration: true,
    restaurantApprovalRequests: true,
    newOrders: false,
    deliveryUpdates: false,
    systemAlerts: true,
    dailyPlatformSummary: true,
  },
  privacy: {
    sessionTimeoutMinutes: 30,
    twoFactorEnabled: true,
  },
  system: {
    allowRestaurantRegistrations: true,
    allowUserRegistrations: true,
    maintenanceMode: false,
  },
  language: 'en',
}

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/hooks/useTheme'
import { clearSettingsCache } from '@/lib/settingsStorage'
import type {
  AdminPasswordForm,
  AdminProfileForm,
  AdminSettingsState,
} from '@/types/Settings'
import { DEFAULT_ADMIN_SETTINGS } from '@/types/Settings'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

export function useAdminSettings() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { user, getProfile, logout } = useAuthStore()
  const [settings, setSettings] = useState<AdminSettingsState>(DEFAULT_ADMIN_SETTINGS)
  const [profile, setProfile] = useState<AdminProfileForm>({
    name: '',
    email: '',
    phone: '',
  })
  const [password, setPassword] = useState<AdminPasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!user) {
      getProfile().catch(() => {})
      return
    }

    setProfile({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
    })
  }, [user, getProfile])

  useEffect(() => {
    if (settings.language && i18n.language !== settings.language) {
      void i18n.changeLanguage(settings.language)
    }
  }, [i18n, settings.language])

  const updateSettings = <K extends keyof AdminSettingsState>(
    key: K,
    value: AdminSettingsState[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  const savePassword = async () => {
    if (!password.currentPassword) {
      toast.error('Current password is required.')
      return
    }
    if (!password.newPassword) {
      toast.error('New password is required.')
      return
    }
    if (password.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }
    if (password.newPassword !== password.confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    toast.error('Password change is not available yet. Backend support is pending.')
  }

  const saveAll = async () => {
    if (!profile.name?.trim()) {
      toast.warning('Name is required.')
      return
    }
    if (!profile.email?.trim()) {
      toast.warning('Email is required.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profile.email)) {
      toast.warning('Please enter a valid email address.')
      return
    }
    toast.error('Settings save is not available yet. Backend support is pending.')
  }

  const toggleTwoFactor = async () => {
    toast.error('Two-factor authentication is not available yet. Backend support is pending.')
  }

  const updateSessionTimeoutValue = async (_minutes: number) => {
    toast.error('Session timeout update is not available yet. Backend support is pending.')
  }

  const updateSystemControl = async (_key: string, _value: boolean) => {
    toast.error('System controls update is not available yet. Backend support is pending.')
  }

  const updatePlatform = async (_platformData: unknown) => {
    toast.error('Platform settings update is not available yet. Backend support is pending.')
  }

  const updateNotifications = async (_notificationsData: unknown) => {
    toast.error('Notification settings update is not available yet. Backend support is pending.')
  }

  const updatePrivacy = async (_privacyData: unknown) => {
    toast.error('Privacy settings update is not available yet. Backend support is pending.')
  }

  const updateLanguageValue = async (_language: string) => {
    toast.error('Language update is not available yet. Backend support is pending.')
  }

  const handleLogout = async () => {
    try {
      clearSettingsCache()
      await logout()
      navigate('/login')
      toast.success('Logged out successfully.')
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    theme,
    setTheme,
    settings,
    updateSettings,
    profile,
    setProfile,
    password,
    setPassword,
    isSaving: false,
    isSavingPassword: false,
    savePassword,
    saveAll,
    handleLogout,
    toggleTwoFactor,
    updateSessionTimeout: updateSessionTimeoutValue,
    updateSystemControl,
    updatePlatform,
    updateNotifications,
    updatePrivacy,
    updateLanguage: updateLanguageValue,
  }
}
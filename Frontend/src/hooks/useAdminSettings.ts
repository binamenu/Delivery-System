import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/hooks/useTheme'
import { loadAdminSettings, clearSettingsCache } from '@/lib/settingsStorage'
import { 
  updateAdminPassword, 
  updateAdminProfile,
  updateTwoFactorStatus,
  updateSessionTimeout,
  updateSystemControls,
  updatePlatformSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  updateLanguage,
  saveAllSettings
} from '@/lib/settingsApi'
import type {
  AdminPasswordForm,
  AdminProfileForm,
  AdminSettingsState,
  SessionTimeout,
  AdminLanguage,
} from '@/types/Settings'

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

export function useAdminSettings() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { user, getProfile, logout } = useAuthStore()
  const [settings, setSettings] = useState<AdminSettingsState>(loadAdminSettings)
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
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

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

    setIsSavingPassword(true)
    try {
      await updateAdminPassword(password)
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated successfully.')
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error('Password update error:', error)
    } finally {
      setIsSavingPassword(false)
    }
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

    setIsSaving(true)
    let profileUpdated = false
    let settingsUpdated = false
    
    try {
      try {
        await updateAdminProfile(profile)
        await getProfile().catch(() => {})
        profileUpdated = true
      } catch (profileError) {
        toast.warning('Profile update failed. Please check your information and try again.')
        console.error('Profile update error:', profileError)
        setIsSaving(false)
        return
      }

      try {
        await saveAllSettings({
          profile,
          settings
        })
        settingsUpdated = true
      } catch (settingsError) {
        toast.error('Settings update failed. Please try again.')
        console.error('Settings update error:', settingsError)
        setIsSaving(false)
        return
      }
      
      await i18n.changeLanguage(settings.language)
      
      if (profileUpdated && settingsUpdated) {
        toast.success('All settings saved successfully.')
      } else if (profileUpdated && !settingsUpdated) {
        toast.warning('Profile updated but settings failed to save.')
      } else if (!profileUpdated && settingsUpdated) {
        toast.warning('Settings updated but profile failed to save.')
      }
    } catch (error) {
      toast.error('An unexpected error occurred while saving.')
      console.error('Save all error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTwoFactor = async () => {
    const newValue = !settings.privacy.twoFactorEnabled
    try {
      const result = await updateTwoFactorStatus(newValue)
      updateSettings('privacy', {
        ...settings.privacy,
        twoFactorEnabled: result.enabled ?? newValue,
      })
      toast.success(`2FA ${newValue ? 'enabled' : 'disabled'} successfully.`)
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error('2FA toggle error:', error)
    }
  }

  const updateSessionTimeoutValue = async (minutes: SessionTimeout) => {
    try {
      await updateSessionTimeout(minutes)
      updateSettings('privacy', {
        ...settings.privacy,
        sessionTimeoutMinutes: minutes,
      })
      toast.success(`Session timeout set to ${minutes} minutes.`)
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error('Session timeout update error:', error)
    }
  }

  const updateSystemControl = async (
    key: keyof AdminSettingsState['system'],
    value: boolean
  ) => {
    try {
      const updatedSystem = {
        ...settings.system,
        [key]: value,
      }
      const result = await updateSystemControls(updatedSystem)
      updateSettings('system', result)
      toast.success(`${key} updated successfully.`)
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error('System control update error:', error)
    }
  }

  const updatePlatform = async (platformData: AdminSettingsState['platform']) => {
    try {
      const result = await updatePlatformSettings(platformData)
      updateSettings('platform', result)
      toast.success('Platform settings updated successfully.')
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error('Platform update error:', error)
    }
  }

  const updateNotifications = async (notificationsData: AdminSettingsState['notifications']) => {
    try {
      const result = await updateNotificationSettings(notificationsData)
      updateSettings('notifications', result)
      toast.success('Notification settings updated successfully.')
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error('Notifications update error:', error)
    }
  }

  const updatePrivacy = async (privacyData: AdminSettingsState['privacy']) => {
    try {
      const result = await updatePrivacySettings(privacyData)
      updateSettings('privacy', result)
      toast.success('Privacy settings updated successfully.')
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error('Privacy update error:', error)
    }
  }

  const updateLanguageValue = async (language: AdminLanguage) => {
    try {
      await updateLanguage(language)
      updateSettings('language', language)
      await i18n.changeLanguage(language)
      toast.success('Language updated successfully.')
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error('Language update error:', error)
    }
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
    isSaving,
    isSavingPassword,
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
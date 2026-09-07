import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/hooks/useTheme'
import { loadAdminSettings, saveAdminSettings } from '@/lib/settingsStorage'
import { updateAdminPassword, updateAdminProfile } from '@/lib/settingsApi'
import type {
  AdminPasswordForm,
  AdminProfileForm,
  AdminSettingsState,
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
    if (!password.currentPassword || !password.newPassword) {
      toast.error('Enter your current and new password.')
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
      toast.success('Password updated.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSavingPassword(false)
    }
  }

  const saveAll = async () => {
    setIsSaving(true)
    try {
      if (profile.name.trim() && profile.email.trim()) {
        try {
          await updateAdminProfile(profile)
          await getProfile().catch(() => {})
        } catch {
          // Profile endpoint may not exist yet; keep local form values.
        }
      }

      saveAdminSettings(settings)
      await i18n.changeLanguage(settings.language)
      toast.success('Settings saved.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
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
  }
}

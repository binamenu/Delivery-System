import { toast } from 'sonner'
import { useState } from 'react'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import type { AdminCurrency, AdminLanguage, SessionTimeout } from '@/types/Settings'
import {
  SettingsAlertBanner,
  SettingsCard,
  SettingsField,
  SettingsLinkRow,
  SettingsPasswordField,
  SettingsSelect,
  SettingsThemeSelector,
  SettingsToggle,
} from '@/components/settings'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  manager: 'Restaurant Manager',
  restaurant_manager: 'Restaurant Manager',
  driver: 'Driver',
  customer: 'Customer',
}

const CURRENCY_OPTIONS = [
  { value: 'ETB', label: 'ETB' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
]

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'am', label: 'Amharic' },
]

const SESSION_TIMEOUT_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' },
  { value: '120', label: '120 minutes' },
]

export default function SettingsPage() {
  const {
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
    updateSessionTimeout,
    updateSystemControl,
  } = useAdminSettings()

  const [confirmAction, setConfirmAction] = useState<{
    key: string
    value: boolean
    message: string
  } | null>(null)

  const initial = (profile.name || user?.name || 'A').trim().charAt(0).toUpperCase()
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? 'Administrator'

  const handleSystemControlChange = (key: string, value: boolean) => {
    const destructiveActions = ['maintenanceMode', 'allowRestaurantRegistrations', 'allowUserRegistrations']
    
    if (destructiveActions.includes(key) && value === true) {
      let message = ''
      if (key === 'maintenanceMode') {
        message = 'Are you sure you want to enable maintenance mode? This will block all user access to the platform. Users will not be able to place orders or access their accounts.'
      } else if (key === 'allowRestaurantRegistrations') {
        message = 'Are you sure you want to disable restaurant registrations? New restaurants will not be able to register.'
      } else if (key === 'allowUserRegistrations') {
        message = 'Are you sure you want to disable user registrations? New users will not be able to create accounts.'
      }
      
      setConfirmAction({
        key,
        value,
        message,
      })
    } else {
      updateSystemControl(key as keyof typeof settings.system, value)
    }
  }

  const handleConfirmAction = () => {
    if (confirmAction) {
      updateSystemControl(confirmAction.key as keyof typeof settings.system, confirmAction.value)
      setConfirmAction(null)
    }
  }

  const handleSessionTimeoutChange = (value: string) => {
    const timeout = Number(value) as SessionTimeout
    updateSessionTimeout(timeout)
  }

  const handle2FAToggle = () => {
    toggleTwoFactor()
  }

  const handleSaveAll = async () => {
    if (!profile.name || !profile.name.trim()) {
      toast.warning('Name and email are required fields')
      return
    }
    if (!profile.email || !profile.email.trim()) {
      toast.warning('Name and email are required fields')
      return
    }

    try {
      await saveAll()
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  const handleSavePassword = async () => {
    if (password.newPassword !== password.confirmPassword) {
      toast.warning('New password and confirm password do not match')
      return
    }

    if (password.newPassword && password.newPassword.length < 8) {
      toast.warning('Password must be at least 8 characters long')
      return
    }

    try {
      await savePassword()
    } catch (error) {
      console.error('Password save error:', error)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <SettingsCard title="Account & Profile">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
              {initial}
            </div>
            <span className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile.name || user?.name || '—'}</p>
            <p className="text-sm text-gray-500">{profile.email || user?.email || '—'}</p>
            <span className="mt-1 inline-flex rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SettingsField
            label="Full Name *"
            name="name"
            value={profile.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
          />
          <SettingsField
            label="Email Address *"
            name="email"
            type="email"
            value={profile.email}
            onChange={(event) => setProfile({ ...profile, email: event.target.value })}
          />
          <SettingsField
            label="Phone Number"
            name="phone"
            type="tel"
            value={profile.phone}
            onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Security — Change Password">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SettingsPasswordField
            id="currentPassword"
            label="Current Password"
            autoComplete="current-password"
            value={password.currentPassword}
            onChange={(value) => setPassword({ ...password, currentPassword: value })}
          />
          <SettingsPasswordField
            id="newPassword"
            label="New Password"
            autoComplete="new-password"
            value={password.newPassword}
            onChange={(value) => setPassword({ ...password, newPassword: value })}
          />
          <SettingsPasswordField
            id="confirmPassword"
            label="Confirm New Password"
            autoComplete="new-password"
            value={password.confirmPassword}
            onChange={(value) => setPassword({ ...password, confirmPassword: value })}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={isSavingPassword}
            onClick={() => void handleSavePassword()}
            className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {isSavingPassword ? 'Saving...' : 'Save Password'}
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="Platform Settings">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsField
            label="Platform Name"
            name="platformName"
            value={settings.platform.platformName}
            onChange={(event) =>
              updateSettings('platform', { ...settings.platform, platformName: event.target.value })
            }
          />
          <SettingsField
            label="Support Email"
            name="supportEmail"
            type="email"
            value={settings.platform.supportEmail}
            onChange={(event) =>
              updateSettings('platform', { ...settings.platform, supportEmail: event.target.value })
            }
          />
          <SettingsField
            label="Support Phone"
            name="supportPhone"
            type="tel"
            value={settings.platform.supportPhone}
            onChange={(event) =>
              updateSettings('platform', { ...settings.platform, supportPhone: event.target.value })
            }
          />
          <SettingsSelect
            label="Currency"
            name="currency"
            value={settings.platform.currency}
            options={CURRENCY_OPTIONS}
            onChange={(event) =>
              updateSettings('platform', {
                ...settings.platform,
                currency: event.target.value as AdminCurrency,
              })
            }
          />
          <SettingsField
            label="Default Delivery Fee (ETB)"
            name="defaultDeliveryFee"
            type="number"
            min={0}
            value={settings.platform.defaultDeliveryFee}
            onChange={(event) =>
              updateSettings('platform', {
                ...settings.platform,
                defaultDeliveryFee: Number(event.target.value) || 0,
              })
            }
          />
          <SettingsField
            label="Minimum Order Amount (ETB)"
            name="minimumOrderAmount"
            type="number"
            min={0}
            value={settings.platform.minimumOrderAmount}
            onChange={(event) =>
              updateSettings('platform', {
                ...settings.platform,
                minimumOrderAmount: Number(event.target.value) || 0,
              })
            }
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Notification Settings">
        <SettingsToggle
          title="New restaurant registration"
          description="Alert when a new restaurant submits an application"
          checked={settings.notifications.newRestaurantRegistration}
          onChange={(checked) =>
            updateSettings('notifications', {
              ...settings.notifications,
              newRestaurantRegistration: checked,
            })
          }
        />
        <SettingsToggle
          title="Restaurant approval requests"
          description="Notify when restaurants are awaiting approval"
          checked={settings.notifications.restaurantApprovalRequests}
          onChange={(checked) =>
            updateSettings('notifications', {
              ...settings.notifications,
              restaurantApprovalRequests: checked,
            })
          }
        />
        <SettingsToggle
          title="New orders"
          description="Platform-wide new order notifications"
          checked={settings.notifications.newOrders}
          onChange={(checked) =>
            updateSettings('notifications', { ...settings.notifications, newOrders: checked })
          }
        />
        <SettingsToggle
          title="Delivery updates"
          description="Driver activity and delivery status changes"
          checked={settings.notifications.deliveryUpdates}
          onChange={(checked) =>
            updateSettings('notifications', { ...settings.notifications, deliveryUpdates: checked })
          }
        />
        <SettingsToggle
          title="System alerts"
          description="Errors, downtime, and infrastructure warnings"
          checked={settings.notifications.systemAlerts}
          onChange={(checked) =>
            updateSettings('notifications', { ...settings.notifications, systemAlerts: checked })
          }
        />
        <SettingsToggle
          title="Daily platform summary"
          description="Morning digest of orders, revenue, and activity"
          checked={settings.notifications.dailyPlatformSummary}
          onChange={(checked) =>
            updateSettings('notifications', {
              ...settings.notifications,
              dailyPlatformSummary: checked,
            })
          }
        />
      </SettingsCard>

      <SettingsCard title="Appearance">
        <div className="space-y-5">
          <SettingsThemeSelector value={theme} onChange={setTheme} />
          <div className="max-w-xs">
            <SettingsSelect
              label="Language"
              name="language"
              value={settings.language}
              options={LANGUAGE_OPTIONS}
              onChange={(event) =>
                updateSettings('language', event.target.value as AdminLanguage)
              }
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Privacy & Security">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <p className="font-medium text-gray-900">Session timeout</p>
              <p className="text-sm text-gray-500">
                Session will expire after this period of inactivity
              </p>
            </div>
            <select
              value={settings.privacy.sessionTimeoutMinutes}
              onChange={(e) => handleSessionTimeoutChange(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {SESSION_TIMEOUT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <p className="font-medium text-gray-900">Two-factor authentication</p>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              onClick={() => void handle2FAToggle()}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                settings.privacy.twoFactorEnabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {settings.privacy.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <SettingsLinkRow
            label="Privacy Policy"
            onClick={() => toast.info('Privacy policy will open when the document is available.')}
          />
          <SettingsLinkRow
            label="Terms and Conditions"
            onClick={() => toast.info('Terms and conditions will open when the document is available.')}
          />
          <SettingsLinkRow
            label="Account Security Settings"
            onClick={() => toast.info('Use the password section above to update account security.')}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="System Controls">
        <SettingsAlertBanner message="Changes to system controls affect the entire platform immediately. Use with caution." />
        <SettingsToggle
          title="Allow new restaurant registrations"
          description="When off, the registration form is hidden from new restaurant managers."
          checked={settings.system.allowRestaurantRegistrations}
          onChange={(checked) =>
            handleSystemControlChange('allowRestaurantRegistrations', checked)
          }
        />
        <SettingsToggle
          title="Allow new user registrations"
          description="When off, new customers and drivers cannot create accounts."
          checked={settings.system.allowUserRegistrations}
          onChange={(checked) =>
            handleSystemControlChange('allowUserRegistrations', checked)
          }
        />
        <SettingsToggle
          title="Maintenance Mode"
          titleClassName="text-red-600"
          description="Platform shows maintenance page to all non-admin users."
          checked={settings.system.maintenanceMode}
          onChange={(checked) =>
            handleSystemControlChange('maintenanceMode', checked)
          }
        />
      </SettingsCard>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
        >
          Log Out
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSaveAll()}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Destructive Action</h2>
            <p className="text-gray-600 mb-6">{confirmAction.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
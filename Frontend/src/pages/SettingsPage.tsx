import { toast } from 'sonner'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import type { AdminCurrency, AdminLanguage } from '@/types/Settings'
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
  } = useAdminSettings()

  const initial = (profile.name || user?.name || 'A').trim().charAt(0).toUpperCase()
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? 'Administrator'

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
            label="Full Name"
            name="name"
            value={profile.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
          />
          <SettingsField
            label="Email Address"
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
            onClick={() => void savePassword()}
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
        <SettingsLinkRow
          label="Session timeout"
          value={`${settings.privacy.sessionTimeoutMinutes} minutes of inactivity`}
        />
        <SettingsLinkRow
          label="Two-factor authentication"
          value={settings.privacy.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          onClick={() =>
            updateSettings('privacy', {
              ...settings.privacy,
              twoFactorEnabled: !settings.privacy.twoFactorEnabled,
            })
          }
        />
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
      </SettingsCard>

      <SettingsCard title="System Controls">
        <SettingsAlertBanner message="Changes to system controls affect the entire platform immediately. Use with caution." />
        <SettingsToggle
          title="Allow new restaurant registrations"
          description="When off, the registration form is hidden from new restaurant managers."
          checked={settings.system.allowRestaurantRegistrations}
          onChange={(checked) =>
            updateSettings('system', { ...settings.system, allowRestaurantRegistrations: checked })
          }
        />
        <SettingsToggle
          title="Allow new user registrations"
          description="When off, new customers and drivers cannot create accounts."
          checked={settings.system.allowUserRegistrations}
          onChange={(checked) =>
            updateSettings('system', { ...settings.system, allowUserRegistrations: checked })
          }
        />
        <SettingsToggle
          title="Maintenance Mode"
          titleClassName="text-red-600"
          description="Platform shows maintenance page to all non-admin users."
          checked={settings.system.maintenanceMode}
          onChange={(checked) =>
            updateSettings('system', { ...settings.system, maintenanceMode: checked })
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
          onClick={() => void saveAll()}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  )
}

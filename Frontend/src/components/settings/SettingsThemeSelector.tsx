import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminThemePreference } from '@/types/Settings'

const THEME_OPTIONS: { value: AdminThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export interface SettingsThemeSelectorProps {
  value: AdminThemePreference
  onChange: (value: AdminThemePreference) => void
}

export function SettingsThemeSelector({ value, onChange }: SettingsThemeSelectorProps) {
  return (
    <div className="inline-flex rounded-xl border border-gray-200 p-1">
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon
        const isActive = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-50',
            )}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

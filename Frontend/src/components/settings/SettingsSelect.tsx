import type { SelectHTMLAttributes } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface SettingsSelectOption {
  value: string
  label: string
}

export interface SettingsSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SettingsSelectOption[]
}

export function SettingsSelect({ label, id, className, options, ...props }: SettingsSelectProps) {
  const fieldId = id ?? props.name

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <select
        id={fieldId}
        className={cn(
          'h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

import type { InputHTMLAttributes } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface SettingsFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function SettingsField({ label, id, className, ...props }: SettingsFieldProps) {
  const fieldId = id ?? props.name

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Input
        id={fieldId}
        className={cn('h-11 rounded-xl border-gray-200', className)}
        {...props}
      />
    </div>
  )
}

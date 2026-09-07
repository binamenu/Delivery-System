import { cn } from '@/lib/utils'

export interface SettingsToggleProps {
  title: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  titleClassName?: string
}

export function SettingsToggle({
  title,
  description,
  checked,
  onChange,
  titleClassName,
}: SettingsToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className={cn('font-medium text-gray-900', titleClassName)}>{title}</p>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-slate-900' : 'bg-gray-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  )
}

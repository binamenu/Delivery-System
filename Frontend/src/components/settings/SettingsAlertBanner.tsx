import { AlertTriangle } from 'lucide-react'

export interface SettingsAlertBannerProps {
  message: string
}

export function SettingsAlertBanner({ message }: SettingsAlertBannerProps) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}

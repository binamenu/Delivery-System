import { ChevronRight } from 'lucide-react'

export interface SettingsLinkRowProps {
  label: string
  value?: string
  onClick?: () => void
}

export function SettingsLinkRow({ label, value, onClick }: SettingsLinkRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 border-b border-gray-100 py-3 text-left last:border-b-0"
    >
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <span className="flex items-center gap-2 text-sm text-gray-500">
        {value}
        {onClick && <ChevronRight className="h-4 w-4" />}
      </span>
    </button>
  )
}

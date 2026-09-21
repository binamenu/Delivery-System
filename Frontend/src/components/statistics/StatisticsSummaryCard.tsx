import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatisticsSummaryCardProps {
  icon: LucideIcon
  value: string
  label: string
  badge: string
  iconClassName?: string
  iconBgClassName?: string
}

export function StatisticsSummaryCard({
  icon: Icon,
  value,
  label,
  badge,
  iconClassName = 'text-orange-500',
  iconBgClassName = 'bg-orange-50',
}: StatisticsSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            iconBgClassName,
            iconClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {badge}
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

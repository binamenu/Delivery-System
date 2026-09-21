import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StatisticsChartCardProps {
  title: string
  children: ReactNode
  className?: string
}

export function StatisticsChartCard({ title, children, className }: StatisticsChartCardProps) {
  return (
    <div className={cn('rounded-2xl border border-gray-100 bg-white p-5 shadow-sm', className)}>
      <h3 className="mb-4 text-base font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  )
}

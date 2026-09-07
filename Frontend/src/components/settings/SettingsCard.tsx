import type { ReactNode } from 'react'

export interface SettingsCardProps {
  title: string
  children: ReactNode
}

export function SettingsCard({ title, children }: SettingsCardProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 border-b border-gray-100 pb-3 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

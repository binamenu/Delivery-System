import { SettingsAlertBanner } from '@/components/settings'
import { CategoryGrid } from '@/components/categories'

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Food Categories</h1>
      </div>

      <SettingsAlertBanner message="⚠️ Category management is coming soon. Backend support is currently in development." />

      <fieldset disabled className="opacity-60">
        <CategoryGrid
          categories={[]}
          isLoading={false}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </fieldset>
    </div>
  )
}
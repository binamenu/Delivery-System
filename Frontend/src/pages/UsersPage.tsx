import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import type { UserRoleFilter } from '@/types/Users'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import {
  RegisterDriverModal,
  RegisterManagerModal,
  UserFilterChips,
  UsersTable,
} from '@/components/users'

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('all')
  const [driverModalOpen, setDriverModalOpen] = useState(false)
  const [managerModalOpen, setManagerModalOpen] = useState(false)
  const {
    users,
    isLoading,
    isError,
    errorMessage,
    pendingId,
    isCreating,
    registerDriver,
    registerManager,
    suspend,
    restore,
  } = useAdminUsers()

  const visibleUsers = useMemo(() => {
    if (roleFilter === 'all') return users
    return users.filter((user) => user.role === roleFilter)
  }, [users, roleFilter])

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <UserFilterChips value={roleFilter} onChange={setRoleFilter} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDriverModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Register Driver
          </button>
          <button
            type="button"
            onClick={() => setManagerModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Register Restaurant Manager
          </button>
        </div>
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage ?? 'Failed to load users. Please try again.'}
        </div>
      )}

      <UsersTable
        users={visibleUsers}
        isLoading={isLoading}
        pendingId={pendingId}
        onSuspend={suspend}
        onRestore={restore}
      />

      <RegisterDriverModal
        open={driverModalOpen}
        isSubmitting={isCreating}
        onClose={() => setDriverModalOpen(false)}
        onSubmit={async (values) => {
          await registerDriver(values)
          setDriverModalOpen(false)
        }}
      />

      <RegisterManagerModal
        open={managerModalOpen}
        isSubmitting={isCreating}
        onClose={() => setManagerModalOpen(false)}
        onSubmit={async (values) => {
          await registerManager(values)
          setManagerModalOpen(false)
        }}
      />
    </div>
  )
}

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createDriver,
  createRestaurantManager,
  fetchUsers,
} from '@/lib/usersApi'
import { getApiErrorMessage } from '@/lib/http'
import type {
  AdminUser,
  RegisterDriverInput,
  RegisterManagerInput,
} from '@/types/Users'

const QUERY_KEY = ['users'] as const

export function useAdminUsers() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchUsers,
    staleTime: 30_000,
  })
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const users = useMemo(() => query.data ?? [], [query.data])

  const emailExists = useCallback(
    (email: string) => users.some((user) => user.email.toLowerCase() === email.toLowerCase()),
    [users],
  )

  const registerDriver = useCallback(
    async (input: RegisterDriverInput) => {
      if (emailExists(input.email)) {
        toast.error('A user with this email already exists.')
        throw new Error('duplicate-email')
      }

      setIsCreating(true)
      try {
        const user = await createDriver(input)
        queryClient.setQueryData<AdminUser[]>(QUERY_KEY, (current) => {
          const next = [...(current ?? []).filter((item) => item.id !== user.id), user]
          return next.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
        })
        toast.success(`${user.name} was registered.`)
      } catch (error) {
        if (error instanceof Error && error.message === 'duplicate-email') {
          throw error
        }
        toast.error(getApiErrorMessage(error))
        throw error
      } finally {
        setIsCreating(false)
      }
    },
    [emailExists, queryClient],
  )

  const registerManager = useCallback(
    async (input: RegisterManagerInput) => {
      if (emailExists(input.email)) {
        toast.error('A user with this email already exists.')
        throw new Error('duplicate-email')
      }

      setIsCreating(true)
      try {
        const user = await createRestaurantManager(input)
        queryClient.setQueryData<AdminUser[]>(QUERY_KEY, (current) => {
          const next = [...(current ?? []).filter((item) => item.id !== user.id), user]
          return next.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
        })
        toast.success(`${user.name} was registered.`)
      } catch (error) {
        if (error instanceof Error && error.message === 'duplicate-email') {
          throw error
        }
        toast.error(getApiErrorMessage(error))
        throw error
      } finally {
        setIsCreating(false)
      }
    },
    [emailExists, queryClient],
  )

  const suspend = useCallback((user: AdminUser) => {
    setPendingId(user.id)
    toast.error('User status cannot be changed. The API has no user suspend endpoint.')
    setPendingId(null)
  }, [])

  const restore = useCallback((user: AdminUser) => {
    setPendingId(user.id)
    toast.error('User status cannot be changed. The API has no user restore endpoint.')
    setPendingId(null)
  }, [])

  return {
    users,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error ? getApiErrorMessage(query.error) : null,
    pendingId,
    isCreating,
    registerDriver,
    registerManager,
    suspend,
    restore,
  }
}

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '@/lib/categoriesApi'
import { fetchRestaurants } from '@/lib/restaurantsApi'
import { getApiErrorMessage } from '@/lib/http'
import type { CategoryFormInput, FoodCategory } from '@/types/Categories'

const QUERY_KEY = ['categories'] as const

function withRestaurantCounts(
  categories: FoodCategory[],
  restaurantCategories: string[],
): FoodCategory[] {
  if (restaurantCategories.length === 0) return categories

  return categories.map((category) => {
    const count = restaurantCategories.filter(
      (name) => name.toLowerCase() === category.name.toLowerCase(),
    ).length

    return {
      ...category,
      restaurantCount: Math.max(category.restaurantCount, count),
    }
  })
}

export function useAdminCategories() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchCategories,
    staleTime: 30_000,
  })
  const restaurantsQuery = useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
    staleTime: 30_000,
  })
  const [isSaving, setIsSaving] = useState(false)

  const restaurantCategories = useMemo(
    () => (restaurantsQuery.data ?? []).map((restaurant) => restaurant.category).filter(Boolean),
    [restaurantsQuery.data],
  )

  const categories = useMemo(
    () => withRestaurantCounts(query.data ?? [], restaurantCategories),
    [query.data, restaurantCategories],
  )

  const nameExists = useCallback(
    (name: string, excludeId?: number) =>
      categories.some(
        (category) =>
          category.id !== excludeId && category.name.toLowerCase() === name.trim().toLowerCase(),
      ),
    [categories],
  )

  const addCategory = useCallback(
    async (input: CategoryFormInput) => {
      if (nameExists(input.name)) {
        toast.error('A category with this name already exists.')
        throw new Error('duplicate-name')
      }

      setIsSaving(true)
      try {
        const category = await createCategory(input)
        queryClient.setQueryData<FoodCategory[]>(QUERY_KEY, (current) =>
          [...(current ?? []).filter((item) => item.id !== category.id), category].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        )
        await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        toast.success(`${category.name} was added.`)
      } catch (error) {
        if (error instanceof Error && error.message === 'duplicate-name') throw error
        toast.error(getApiErrorMessage(error))
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [nameExists, queryClient],
  )

  const editCategory = useCallback(
    async (id: number, input: CategoryFormInput) => {
      if (nameExists(input.name, id)) {
        toast.error('A category with this name already exists.')
        throw new Error('duplicate-name')
      }

      setIsSaving(true)
      try {
        const next = await updateCategory(id, input)
        queryClient.setQueryData<FoodCategory[]>(QUERY_KEY, (current) =>
          (current ?? []).map((item) => (item.id === id ? next : item)),
        )
        await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        toast.success(`${next.name} was updated.`)
      } catch (error) {
        if (error instanceof Error && error.message === 'duplicate-name') throw error
        toast.error(getApiErrorMessage(error))
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [nameExists, queryClient],
  )

  const removeCategory = useCallback(
    async (category: FoodCategory) => {
      setIsSaving(true)
      try {
        await deleteCategory(category.id)
        queryClient.setQueryData<FoodCategory[]>(QUERY_KEY, (current) =>
          (current ?? []).filter((item) => item.id !== category.id),
        )
        await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        toast.success(`${category.name} was deleted.`)
      } catch (error) {
        toast.error(getApiErrorMessage(error))
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [queryClient],
  )

  return {
    categories,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error ? getApiErrorMessage(query.error) : null,
    isSaving,
    addCategory,
    editCategory,
    removeCategory,
  }
}

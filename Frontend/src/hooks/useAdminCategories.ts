import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/lib/categoriesApi'
import { fetchRestaurants } from '@/lib/restaurantsApi'
import type { CategoryFormInput, FoodCategory } from '@/types/Categories'

const QUERY_KEY = ['categories'] as const

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

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
  const [isSaving] = useState(false)

  const restaurantCategories = useMemo(
    () => (restaurantsQuery.data ?? []).map((restaurant) => restaurant.category).filter(Boolean),
    [restaurantsQuery.data],
  )

  const categories = useMemo(
    () => withRestaurantCounts(query.data ?? [], restaurantCategories),
    [query.data, restaurantCategories],
  )

  const addCategory = async (input: CategoryFormInput) => {
    throw new Error('Category management is not available yet. Backend support is pending.')
  }

  const editCategory = async (id: number, input: CategoryFormInput) => {
    throw new Error('Category management is not available yet. Backend support is pending.')
  }

  const removeCategory = async (category: FoodCategory) => {
    throw new Error('Category management is not available yet. Backend support is pending.')
  }

  return {
    categories,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
    isSaving,
    addCategory,
    editCategory,
    removeCategory,
  }
}
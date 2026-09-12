import type { FoodCategory } from '@/types/Categories'

export async function fetchCategories(): Promise<FoodCategory[]> {
  return []
}

export async function createCategory(_input: unknown): Promise<FoodCategory> {
  throw new Error('Category management is not available yet. Backend support is pending.')
}

export async function updateCategory(_id: number, _input: unknown): Promise<FoodCategory> {
  throw new Error('Category management is not available yet. Backend support is pending.')
}

export async function deleteCategory(_id: number): Promise<boolean> {
  throw new Error('Category management is not available yet. Backend support is pending.')
}
import type { CategoryFormInput, CategoryIconKey, FoodCategory } from '@/types/Categories'

const ICON_KEYS: CategoryIconKey[] = [
  'bowl',
  'pizza',
  'burger',
  'sushi',
  'coffee',
  'dessert',
  'salad',
  'chicken',
  'default',
]

function normalizeIconKey(value: string | undefined): CategoryIconKey {
  if (value && ICON_KEYS.includes(value as CategoryIconKey)) {
    return value as CategoryIconKey
  }
  return 'default'
}

export async function fetchCategories(): Promise<FoodCategory[]> {
  return []
}

export async function createCategory(input: CategoryFormInput): Promise<FoodCategory> {
  throw new Error('Category management is not available yet. Backend support is pending.')
}

export async function updateCategory(
  id: number,
  input: CategoryFormInput,
): Promise<FoodCategory> {
  throw new Error('Category management is not available yet. Backend support is pending.')
}

export async function deleteCategory(id: number): Promise<boolean> {
  throw new Error('Category management is not available yet. Backend support is pending.')
}
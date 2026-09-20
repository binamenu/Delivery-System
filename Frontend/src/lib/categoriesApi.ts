import api from '@/lib/api'
import { unwrapList, unwrapRecord } from '@/lib/http'
import type { CategoryFormInput, CategoryIconKey, FoodCategory } from '@/types/Categories'

interface CategoryApiRecord {
  id: number
  name: string
  description?: string | null
}

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

function iconFromName(name: string): CategoryIconKey {
  const lower = name.toLowerCase()
  return ICON_KEYS.find((key) => key !== 'default' && lower.includes(key)) ?? 'default'
}

export function mapCategory(record: CategoryApiRecord): FoodCategory {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? '',
    iconKey: iconFromName(record.name),
    restaurantCount: 0,
  }
}

function payload(input: CategoryFormInput) {
  return {
    name: input.name.trim(),
    description: input.description.trim() || null,
  }
}

export async function fetchCategories(): Promise<FoodCategory[]> {
  const response = await api.get('categories')
  return unwrapList<CategoryApiRecord>(response.data).map(mapCategory)
}

export async function createCategory(input: CategoryFormInput): Promise<FoodCategory> {
  const response = await api.post('categories', payload(input))
  const record = unwrapRecord<CategoryApiRecord>(response.data)
  if (!record) {
    throw new Error('Category create response was empty.')
  }
  return mapCategory(record)
}

export async function updateCategory(id: number, input: CategoryFormInput): Promise<FoodCategory> {
  const response = await api.put(`categories/${id}`, payload(input))
  const record = unwrapRecord<CategoryApiRecord>(response.data)
  if (!record) {
    throw new Error('Category update response was empty.')
  }
  return mapCategory(record)
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`categories/${id}`)
}

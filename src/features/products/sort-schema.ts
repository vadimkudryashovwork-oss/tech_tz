/**
 * Преференсы сортировки товаров.
 * Доменная логика: поля, дефолты, контракт для effector-storage.
 */
import { config } from '@/shared/config/common'
import type { ProductSort, ProductSortOrder, ProductTableColumnKey } from '@/shared/types/product'
import { z } from 'zod'

export const SORT_STORAGE_KEY = `${config.APP_NAME}/products-sort`
export const DEFAULT_SORT: ProductSort = { field: 'price', order: 'desc' }

const SORT_FIELDS = [
  'title',
  'brand',
  'sku',
  'price',
  'rating',
] as const satisfies readonly ProductTableColumnKey[]
const SORT_ORDERS = ['asc', 'desc'] as const satisfies readonly ProductSortOrder[]

const sortStateSchema = z.object({
  field: z.enum(SORT_FIELDS),
  order: z.enum(SORT_ORDERS),
})

/** Контракт для валидации данных из localStorage (effector-storage contract). */
export function isSortState(raw: unknown): raw is ProductSort {
  return sortStateSchema.safeParse(raw).success
}

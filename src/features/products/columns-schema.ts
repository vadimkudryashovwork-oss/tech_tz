/**
 * Конфиг колонок таблицы товаров.
 * Единый источник: лейблы, accessor, сортировка, валидация формы.
 */

import type { Product, ProductFormField, ProductTableColumnKey } from '@/shared/types/product'

export type ProductCellType = 'text' | 'price' | 'rating'

interface ProductColumnBase<TKey extends ProductTableColumnKey> {
  key: TKey
  /** Заголовок в таблице */
  label: string
  /** Лейбл в форме (если отличается: цена «Цена» vs таблица «Цена, ₽») */
  formLabel?: string
  /** Доступ к значению из product */
  accessor: (product: Product) => Product[TKey]
  /** Тип ячейки для рендера */
  cellType: ProductCellType
  /** Дефолтный порядок при первом клике */
  defaultOrder: 'asc' | 'desc'
  /** Показать кнопку сортировки в заголовке */
  sortableInHeader: boolean
  /** Сообщение валидации required для формы */
  requiredMessage?: string
  /** Доп. правило валидации (например price) */
  priceValidationMessage?: string
}

export type ProductFormColumn =
  | (ProductColumnBase<'title'> & { requiredMessage: string })
  | (ProductColumnBase<'brand'> & { requiredMessage: string })
  | (ProductColumnBase<'sku'> & { requiredMessage: string })
  | (ProductColumnBase<'price'> & {
      requiredMessage: string
      priceValidationMessage: string
    })

export type ProductColumn = ProductFormColumn | ProductColumnBase<'rating'>

const titleColumn = {
  key: 'title',
  label: 'Наименование',
  accessor: (p) => p.title,
  cellType: 'text',
  defaultOrder: 'asc',
  sortableInHeader: false,
  requiredMessage: 'Введите наименование',
} satisfies ProductFormColumn

const brandColumn = {
  key: 'brand',
  label: 'Вендор',
  accessor: (p) => p.brand,
  cellType: 'text',
  defaultOrder: 'asc',
  sortableInHeader: true,
  requiredMessage: 'Введите вендора',
} satisfies ProductFormColumn

const skuColumn = {
  key: 'sku',
  label: 'Артикул',
  accessor: (p) => p.sku,
  cellType: 'text',
  defaultOrder: 'asc',
  sortableInHeader: true,
  requiredMessage: 'Введите артикул',
} satisfies ProductFormColumn

const ratingColumn = {
  key: 'rating',
  label: 'Оценка',
  accessor: (p) => p.rating,
  cellType: 'rating',
  defaultOrder: 'desc',
  sortableInHeader: true,
} satisfies ProductColumn

const priceColumn = {
  key: 'price',
  label: 'Цена, ₽',
  formLabel: 'Цена',
  accessor: (p) => p.price,
  cellType: 'price',
  defaultOrder: 'desc',
  sortableInHeader: true,
  requiredMessage: 'Введите цену',
  priceValidationMessage: 'Цена должна быть больше 0',
} satisfies ProductFormColumn

export const FORM_COLUMNS = [
  titleColumn,
  brandColumn,
  skuColumn,
  priceColumn,
] as const satisfies readonly ProductFormColumn[]

export const PRODUCT_COLUMNS = [
  titleColumn,
  brandColumn,
  skuColumn,
  ratingColumn,
  priceColumn,
] as const satisfies readonly ProductColumn[]

/** Колонки с полями формы (title, brand, sku, price) */
export const PRODUCT_FORM_FIELDS = FORM_COLUMNS.map((column) => column.key) as readonly ProductFormField[]

/** Получить defaultOrder для поля сортировки */
export function getDefaultOrder(field: ProductTableColumnKey): 'asc' | 'desc' {
  return PRODUCT_COLUMNS.find((c) => c.key === field)?.defaultOrder ?? 'asc'
}

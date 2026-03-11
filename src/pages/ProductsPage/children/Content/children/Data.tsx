import { useState } from 'react'
import { useUnit } from 'effector-react'
import {
  $productsMetrics,
  $sort,
  editProductRequestedFn,
  sortChangedFn,
} from '@/features/products/model.ts'
import { PRODUCT_COLUMNS } from '@/features/products/columns-schema'
import { formatPrice } from '@/shared/lib/format.ts'
import { DotsThreeIcon, PlusIcon, SortIcon } from '@/shared/ui/icons.tsx'
import type { Product } from '@/shared/types/product'

function ProductPreview({ product }: { product: Product }) {
  if (product.thumbnail) {
    return <img className="product-cell__image" src={product.thumbnail} alt={product.title} />
  }

  return <div className="product-cell__fallback" aria-hidden="true" />
}

function Data() {
  const [metrics, sort, openEditDialog, changeSort] = useUnit([
    $productsMetrics,
    $sort,
    editProductRequestedFn,
    sortChangedFn,
  ])

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const pageIds = new Set(metrics.items.map((p) => p.id))
  const allPageSelected = pageIds.size > 0 && [...pageIds].every((id) => selectedIds.has(id))
  const somePageSelected = [...pageIds].some((id) => selectedIds.has(id))

  const handleHeaderCheck = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        pageIds.forEach((id) => next.delete(id))
        return next
      })
    } else {
      setSelectedIds((prev) => new Set([...prev, ...pageIds]))
    }
  }

  const handleRowCheck = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <table className="products-table">
      <thead>
        <tr>
          {PRODUCT_COLUMNS.map((col) => (
            <th key={col.key}>
              {col.sortableInHeader ? (
                <button
                  type="button"
                  className="sort-button"
                  onClick={() => changeSort(col.key)}
                  data-active={sort.field === col.key}
                >
                  {col.key === 'price' ? (
                    <span className="sort-button__nowrap">{col.label}</span>
                  ) : (
                    col.label
                  )}
                  <SortIcon />
                  {sort.field === col.key && (
                    <span className="sort-button__order">{sort.order === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ) : (
                <div className="product-cell product-cell--header">
                  <button
                    type="button"
                    className="product-cell__check product-cell__check--header"
                    onClick={handleHeaderCheck}
                    aria-label={allPageSelected ? 'Снять выделение' : 'Выделить все'}
                    data-checked={allPageSelected}
                    data-indeterminate={somePageSelected && !allPageSelected}
                  />
                  <span>{col.label}</span>
                </div>
              )}
            </th>
          ))}
          <th className="products-table__actions-header" aria-label="Действия" />
        </tr>
      </thead>
      <tbody>
        {metrics.items.length ? (
          metrics.items.map((product) => (
            <tr key={product.id} data-selected={selectedIds.has(product.id)}>
              {PRODUCT_COLUMNS.map((col) => (
                <td key={col.key} className={col.key === 'brand' ? 'vendor-cell' : undefined}>
                  {col.key === 'title' && (
                    <div className="product-cell-wrapper">
                      <div className="product-cell__bar" />
                      <div className="product-cell">
                        <button
                          type="button"
                          className="product-cell__check"
                          onClick={() => handleRowCheck(product.id)}
                          aria-label={selectedIds.has(product.id) ? 'Снять' : 'Выделить'}
                          data-checked={selectedIds.has(product.id)}
                        />
                        <ProductPreview product={product} />
                        <div>
                          <strong>{col.accessor(product)}</strong>
                          <span>{product.category}</span>
                        </div>
                      </div>
                    </div>
                  )}

                    {col.key === 'rating' && (
                    <span className="rating-badge" data-low={Number(col.accessor(product)) < 3}>
                      {col.accessor(product)}/5
                    </span>
                  )}

                    {col.key === 'price' && (
                    <span className="price-cell">
                      <span className="price-cell__int">
                        {formatPrice(Number(col.accessor(product))).intPart}
                      </span>
                      <span className="price-cell__dec">
                        ,{formatPrice(Number(col.accessor(product))).decPart}
                      </span>
                    </span>
                  )}

                 {['brand', 'sku'].includes(col.key) && (
                    col.accessor(product)
                  )}
                </td>
              ))}
              <td>
                <div className="product-cell__actions">
                  <button
                    type="button"
                    className="product-cell__add"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditDialog(product)
                    }}
                    aria-label="Изменить"
                  >
                    <PlusIcon width={24} height={24} />
                  </button>
                  <button
                    type="button"
                    className="product-cell__menu"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditDialog(product)
                    }}
                    aria-label="Меню"
                  >
                    <DotsThreeIcon width={32} height={32} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={PRODUCT_COLUMNS.length + 1}>
              <div className="empty-state">
                <strong>Ничего не найдено</strong>
                <span>Измените поисковый запрос или добавьте новую позицию вручную.</span>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export { Data }

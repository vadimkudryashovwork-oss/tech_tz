import { useUnit } from 'effector-react'
import {
  $isProductsLoading,
  $productsError,
  $productsMetrics,
  pageChangedFn,
} from '@/features/products/model.ts'
import { ProductFormDialog } from '@/features/products/ProductFormDialog.tsx'
import { Card } from '@/shared/ui/Card.tsx'
import { Pagination } from '@/shared/ui/Pagination.tsx'
import { ProgressBar } from '@/shared/ui/ProgressBar.tsx'
import { Add } from './children/Add'
import { Data } from './children/Data'

function Content() {
  const [metrics, loading, productsError, changePage] = useUnit([
    $productsMetrics,
    $isProductsLoading,
    $productsError,
    pageChangedFn,
  ])

  const start = metrics.total === 0 ? 0 : (metrics.currentPage - 1) * metrics.pageSize + 1
  const end =
    metrics.total === 0 ? 0 : Math.min(metrics.currentPage * metrics.pageSize, metrics.total)

  return (
    <>
      <Card className="table-card">
        <div className="table-card__header">
          <h2>Все позиции</h2>
          <Add />
        </div>

        <ProgressBar isVisible={loading} />
        {productsError ? <p className="table-card__error">{productsError}</p> : null}

        <div className="table-wrapper">
          <Data />
        </div>

        <div className="table-card__footer">
          <span>
            <span className="table-card__footer-muted">Показано </span>
            <span className="table-card__footer-num">
              {start}-{end}
            </span>
            <span className="table-card__footer-muted"> из </span>
            <span className="table-card__footer-num">{metrics.total}</span>
          </span>

          <Pagination
            currentPage={metrics.currentPage}
            totalPages={metrics.totalPages}
            onChange={changePage}
          />
        </div>
      </Card>

      <ProductFormDialog />
    </>
  )
}

export { Content }

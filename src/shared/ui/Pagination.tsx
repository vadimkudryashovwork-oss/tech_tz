import { CaretLeftIcon, CaretRightIcon } from '@/shared/ui/icons'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onChange: (page: number) => void
}

function getPages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1])

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right)
}

function Pagination({ currentPage, onChange, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = getPages(currentPage, totalPages)

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination__arrow"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        aria-label="Предыдущая страница"
      >
        <CaretLeftIcon />
      </button>
      <div className="pagination__pages">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className="pagination__page"
            data-active={page === currentPage}
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="pagination__arrow"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
        aria-label="Следующая страница"
      >
        <CaretRightIcon />
      </button>
    </div>
  )
}

export { Pagination }

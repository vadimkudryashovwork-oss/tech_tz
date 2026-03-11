import { useUnit } from 'effector-react'
import { createProductRequestedFn, handleRefreshFn } from '@/features/products/model.ts'
import { Button } from '@/shared/ui/Button.tsx'
import { PlusCircleIcon, RefreshIcon } from '@/shared/ui/icons.tsx'

function Add() {
  const [openCreateDialog, handleRefresh] = useUnit([createProductRequestedFn, handleRefreshFn])

  return (
    <div className="table-card__actions">
      <button
        type="button"
        className="table-card__refresh"
        onClick={handleRefresh}
        aria-label="Обновить"
      >
        <RefreshIcon width={22} height={22} />
      </button>
      <Button onClick={openCreateDialog} className="table-card__add-btn">
        <PlusCircleIcon width={22} height={22} />
        Добавить
      </Button>
    </div>
  )
}

export { Add }

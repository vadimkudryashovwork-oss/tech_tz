import { useUnit } from 'effector-react'
import { logoutRequestedFn } from '@/features/auth/model.ts'
import { $search, searchChangedFn } from '@/features/products/model.ts'
import { Button } from '@/shared/ui/Button.tsx'
import { Input } from '@/shared/ui/Input.tsx'

import { CloseIcon, LogoutIcon, SearchIcon } from '@/shared/ui/icons.tsx'

function Header() {
  const [storedQuery, changeSearch, onLogout] = useUnit([
    $search,
    searchChangedFn,
    logoutRequestedFn,
  ])

  return (
    <nav className="products-nav">
      <h1 className="products-nav__title">Товары</h1>
      <div className="products-nav__search">
        <Input
          value={storedQuery}
          onChange={(event) => searchChangedFn(event.target.value)}
          placeholder="Найти"
          icon={<SearchIcon width={24} height={24} />}
          trailing={
            storedQuery ? (
              <button
                type="button"
                className="field__action"
                onClick={() => changeSearch('')}
                aria-label="Очистить"
              >
                <CloseIcon width={14} height={16} />
              </button>
            ) : null
          }
        />
      </div>
      <div className="products-nav__user">
        <Button variant="ghost" onClick={onLogout}>
          <LogoutIcon />
          Выйти
        </Button>
      </div>
    </nav>
  )
}

export { Header }

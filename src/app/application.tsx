import { useUnit } from 'effector-react'
import { $isAuthenticated, $isSessionReady } from '@/features/auth/model'
import { $toasts, toastDismissedFn } from '@/features/products/model'
import { LoginPage } from '@/pages/LoginPage'
import { ProductsPage } from '@/pages/ProductsPage/ProductsPage.tsx'
import { ToastViewport } from '@/shared/ui/ToastViewport'

function App() {
  const [isSessionReady, isAuthenticated, toasts, dismissToast] = useUnit([
    $isSessionReady,
    $isAuthenticated,
    $toasts,
    toastDismissedFn,
  ])

  if (!isSessionReady) {
    return (
      <div className="app-shell">
        <div className="app-splash">
          <div className="spinner" aria-hidden="true" />
        </div>
      </div>
    )
  }

  return (
    <>
      {isAuthenticated ? <ProductsPage /> : <LoginPage />}
      <ToastViewport toasts={toasts} onClose={dismissToast} />
    </>
  )
}

export { App }

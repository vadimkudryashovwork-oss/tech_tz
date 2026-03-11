import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { appStartedFn } from '@/shared/config/init'
import { App } from './application'
import '@/app/styles/index.css'

// Нормализация URL: один адрес / для всего приложения, /login → /
if (typeof window !== 'undefined' && window.location.pathname !== '/') {
  window.history.replaceState(null, '', '/')
}

appStartedFn()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

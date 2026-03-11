import { useEffect } from 'react'
import { useUnit } from 'effector-react'
import { productsPageOpenedFn } from '@/features/products/model.ts'
import { Header } from './children/Header'
import { Content } from './children/Content/Content'

function ProductsPage() {
  const [onPageOpened] = useUnit([productsPageOpenedFn])

  useEffect(() => {
    onPageOpened()
  }, [onPageOpened])

  return (
    <main className="products-layout">
      <Header />
      <Content />
    </main>
  )
}

export { ProductsPage }

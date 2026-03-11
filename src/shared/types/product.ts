export interface Product {
  id: number
  title: string
  category: string
  price: number
  rating: number
  stock: number
  brand: string
  sku: string
  thumbnail: string
}

export interface ProductList {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export type ProductTableColumnKey = 'title' | 'brand' | 'sku' | 'rating' | 'price'
export type ProductFormField = 'title' | 'brand' | 'sku' | 'price'
export type ProductSortOrder = 'asc' | 'desc'

export interface ProductSort {
  field: ProductTableColumnKey
  order: ProductSortOrder
}

export interface ProductEditorForm {
  title: string
  brand: string
  sku: string
  price: string
}

export interface ProductDraft {
  title: string
  brand: string
  sku: string
  price: number
  rating: number
  stock: number
  category: string
}

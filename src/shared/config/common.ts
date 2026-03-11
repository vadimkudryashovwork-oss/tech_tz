const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com',
  APP_NAME: 'itguru',
  API_PRODUCT_FIELDS: 'title,category,price,rating,stock,brand,sku,thumbnail',
  PAGE_SIZE: 20,
  TOAST_DURATION_MS: 2800,
  SEARCH_DEBOUNCE_MS: 450,
} as const

export { config }

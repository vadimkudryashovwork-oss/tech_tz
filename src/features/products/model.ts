import { combine, createEffect, createEvent, createStore, sample } from 'effector'
import { debounce } from 'patronum/debounce'
import { fetchProductsRequest } from '@/shared/api/query'
import { FORM_COLUMNS, getDefaultOrder } from '@/features/products/columns-schema'
import { DEFAULT_SORT, isSortState, SORT_STORAGE_KEY } from '@/features/products/sort-schema'
import { config } from '@/shared/config/common'
import { createForm } from 'effector-forms'
import { rules } from '@/shared/lib/rules'
import { persist } from 'effector-storage/local'
import { logoutRequestedFn } from '@/features/auth/model'
import type {
  Product,
  ProductDraft,
  ProductEditorForm,
  ProductSort,
  ProductTableColumnKey,
} from '@/shared/types/product'
import type { ToastItem } from '@/shared/types/toast'

let localProductIdCounter = 0

function nextLocalProductId(): number {
  localProductIdCounter += 1
  return -localProductIdCounter
}

function buildLocalProduct(values: ProductDraft) {
  return {
    id: nextLocalProductId(),
    ...values,
    thumbnail: '',
  } satisfies Product
}

function upsertProduct(products: Product[], product: Product) {
  const nextProducts = [...products]
  const index = nextProducts.findIndex((item) => item.id === product.id)
  if (index === -1) {
    nextProducts.unshift(product)
    return nextProducts
  }
  nextProducts[index] = product
  return nextProducts
}

function productMatchesSearch(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const fields = [product.title, product.brand, product.sku, product.category]
  return fields.some((f) => f.toLowerCase().includes(q))
}

// ======================== TYPES ======================= //

const PAGE_SIZE = config.PAGE_SIZE
const TOAST_DURATION_MS = config.TOAST_DURATION_MS
const SEARCH_DEBOUNCE_MS = config.SEARCH_DEBOUNCE_MS

interface ProductEditorState {
  isOpen: boolean
  mode: 'create' | 'edit'
  product: Product | null
}

interface ProductsMetrics {
  currentPage: number
  total: number
  totalPages: number
  pageSize: number
  items: Product[]
}

type ToastDraft = Omit<ToastItem, 'id'>

// ====== INIT UNITS EVENTS / STORES / EFFECTS / DERIVED ======= //

/** Открыта страница товаров */
const productsPageOpenedFn = createEvent<void>()
/** Перегружаем данные */
const handleRefreshFn = createEvent<void>()
/** Изменён поисковый запрос */
const searchChangedFn = createEvent<string>()
/** Шлем запрос в APi */
const searchFetchFn = createEvent<string>()
/** Изменена сортировка (поле) */
const sortChangedFn = createEvent<ProductTableColumnKey>()
/** Изменена страница пагинации */
const pageChangedFn = createEvent<number>()
/** Запрошено создание товара (открыть форму) */
const createProductRequestedFn = createEvent<void>()
/** Запрошено редактирование товара */
const editProductRequestedFn = createEvent<Product>()
/** Закрыта форма создания/редактирования */
const editorClosedFn = createEvent<void>()
/** Отправлена форма товара (валидные данные) */
const productFormSubmittedFn = createEvent<ProductDraft>()
/** Закрыть toast по id */
const toastDismissedFn = createEvent<number>()

/** Загрузка списка товаров с API */
const fetchProductsFx = createEffect(fetchProductsRequest)
/** Отложенное автоскрытие toast */
const scheduleToastRemovalFx = createEffect(
  (id: number) =>
    new Promise<number>((resolve) => window.setTimeout(() => resolve(id), TOAST_DURATION_MS)),
)

/** Сообщение об ошибке загрузки товаров */
const $productsError = createStore('')
  .on(fetchProductsFx.failData, (_, error) => error.message)
  .reset(fetchProductsFx, searchChangedFn, sortChangedFn, pageChangedFn, logoutRequestedFn)

/** Идёт загрузка товаров */
const $isProductsLoading = fetchProductsFx.pending

/** Текущий поисковый запрос */
const $search = createStore('')
  .on(searchChangedFn, (_, query) => query)
  .reset(logoutRequestedFn)

/** Текущая сортировка (поле и направление). Persist в localStorage через effector-storage. */
const $sort = createStore<ProductSort>(DEFAULT_SORT)
  .on(sortChangedFn, (state, field) => {
    if (state.field === field) {
      return {
        field,
        order: state.order === 'asc' ? 'desc' : 'asc',
      }
    }
    return {
      field,
      order: getDefaultOrder(field),
    }
  })
  .on(logoutRequestedFn, () => DEFAULT_SORT)

persist({
  store: $sort,
  key: SORT_STORAGE_KEY,
  contract: isSortState,
})

/** Текущая страница пагинации */
const $currentPage = createStore(1)
  .on(pageChangedFn, (_, page) => page)
  .reset(searchChangedFn, sortChangedFn, productsPageOpenedFn, logoutRequestedFn)

/** Товары с сервера (текущая страница) */
const $remoteProducts = createStore<Product[]>([])
  .on(fetchProductsFx.doneData, (_, response) => response.products)
  .reset(logoutRequestedFn)

/** Общее количество товаров на сервере */
const $remoteTotal = createStore(0)
  .on(fetchProductsFx.doneData, (_, response) => response.total)
  .reset(logoutRequestedFn)

/** Локально созданные/изменённые товары */
const $localProducts = createStore<Product[]>([]).reset(logoutRequestedFn)

/** Состояние модалки формы: открыта/режим/редактируемый товар */
const $editorState = createStore<ProductEditorState>({
  isOpen: false,
  mode: 'create',
  product: null,
})
  .on(createProductRequestedFn, () => ({
    isOpen: true,
    mode: 'create',
    product: null,
  }))
  .on(editProductRequestedFn, (_, product) => ({
    isOpen: true,
    mode: 'edit',
    product,
  }))
  .reset(editorClosedFn, logoutRequestedFn)

/** (внутренний) Товар сохранён в $localProducts */
const productStoredFn = createEvent<Product>()
/** (внутренний) Добавить toast в очередь */
const toastQueuedFn = createEvent<ToastDraft>()
/** (внутренний) Добавить toast с id в список */
const toastPushedFn = createEvent<ToastItem>()

/** Список активных toasts */
const $toasts = createStore<ToastItem[]>([])
  .on(toastPushedFn, (toasts, toast) => [...toasts, toast])
  .on(toastDismissedFn, (toasts, id) => toasts.filter((toast) => toast.id !== id))
  .reset(logoutRequestedFn)

/** Объединённый список товаров: локальные + с сервера, с учётом поиска и страницы */
const $pageItems = combine(
  $remoteProducts,
  $localProducts,
  $search,
  $currentPage,
  (remoteProducts, localProducts, searchQuery, currentPage) => {
    const localProductMap = new Map(localProducts.map((product) => [product.id, product]))
    const remoteIds = new Set(remoteProducts.map((product) => product.id))
    const mergedRemote = remoteProducts.map((product) => localProductMap.get(product.id) ?? product)
    const createdProducts = localProducts
      .filter((product) => !remoteIds.has(product.id))
      .filter((product) => productMatchesSearch(product, searchQuery))
    return currentPage === 1 ? [...createdProducts, ...mergedRemote] : mergedRemote
  },
)

/** Метрики пагинации: currentPage, total, totalPages, pageSize, items */
const $productsMetrics = combine(
  $pageItems,
  $remoteProducts,
  $remoteTotal,
  $localProducts,
  $search,
  $currentPage,
  (items, remoteProducts, remoteTotal, localProducts, searchQuery, currentPage): ProductsMetrics => {
    const remoteIds = new Set(remoteProducts.map((p) => p.id))
    const matchingLocalCount = localProducts
      .filter((p) => p.id < 0 && !remoteIds.has(p.id))
      .filter((p) => productMatchesSearch(p, searchQuery)).length
    const total = remoteTotal + matchingLocalCount
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)
    return {
      currentPage: safePage,
      total,
      totalPages,
      pageSize: PAGE_SIZE,
      items,
    }
  },
)
// ========================= INIT FORM ========================= //

const [titleCol, brandCol, skuCol, priceCol] = FORM_COLUMNS

const productForm = createForm<ProductEditorForm>({
  fields: {
    title: {
      init: '',
      rules: [rules.required(titleCol.requiredMessage)],
    },
    brand: {
      init: '',
      rules: [rules.required(brandCol.requiredMessage)],
    },
    sku: {
      init: '',
      rules: [rules.required(skuCol.requiredMessage)],
    },
    price: {
      init: '0',
      rules: [
        rules.required(priceCol.requiredMessage),
        rules.price(priceCol.priceValidationMessage),
      ],
    },
  },
  validateOn: ['submit'],
})

// ==================== STORAGE PROCESSING BLOCK =============== //

$localProducts.on(productStoredFn, (products, product) => upsertProduct(products, product))

// ======================= LOGIC OPERATORS ===================== //

// ФОРМА ДОБАВЛЕНИЯ / РЕДАКТИРОВАНИЯ

/** При открытии формы создания — сбросить форму */
sample({
  clock: createProductRequestedFn,
  target: productForm.reset,
})

/** При открытии формы редактирования — подставить данные товара в форму */
sample({
  clock: editProductRequestedFn,
  fn: (product) => ({
    title: product.title,
    brand: product.brand,
    sku: product.sku,
    price: String(product.price),
  }),
  target: productForm.setForm,
})

/** При закрытии формы — сбросить форму */
sample({
  clock: editorClosedFn,
  target: productForm.reset,
})

/** При валидной форме — собрать ProductDraft и отправить в productFormSubmittedFn */
sample({
  clock: productForm.formValidated,
  source: $editorState,
  fn: (editorState, values) => ({
    title: values.title.trim(),
    brand: values.brand.trim(),
    sku: values.sku.trim(),
    price: Number(values.price),
    category: editorState.product?.category ?? 'custom',
    rating: editorState.product?.rating ?? 0,
    stock: editorState.product?.stock ?? 0,
  }),
  target: productFormSubmittedFn,
})

/** При отправке формы — сохранить/обновить товар в $localProducts */
sample({
  clock: productFormSubmittedFn,
  source: $editorState,
  fn: (editorState, values) =>
    editorState.mode === 'edit' && editorState.product
      ? { ...editorState.product, ...values }
      : buildLocalProduct(values),
  target: productStoredFn,
})

/** После сохранения товара — закрыть форму */
sample({
  clock: productStoredFn,
  target: editorClosedFn,
})

// TOAST

/** После сохранения товара — показать toast (успех создания/редактирования) */
sample({
  clock: productStoredFn,
  source: $editorState,
  fn: (editorState) => ({
    title: editorState.mode === 'edit' ? 'Товар обновлён' : 'Товар добавлен',
    description:
      editorState.mode === 'edit'
        ? 'Изменения применены локально и уже видны в таблице.'
        : 'Новая позиция добавлена локально без отправки на сервер.',
  }),
  target: toastQueuedFn,
})

/** При постановке toast в очередь — добавить id и в список */
sample({
  clock: toastQueuedFn,
  source: $toasts,
  fn: (toasts, toast) => ({
    ...toast,
    id: (toasts.at(-1)?.id ?? 0) + 1,
  }),
  target: toastPushedFn,
})

/** При добавлении toast — запланировать автоскрытие */
sample({
  clock: toastPushedFn,
  fn: (toast) => toast.id,
  target: scheduleToastRemovalFx,
})

/** По истечении таймера — убрать toast из списка */
sample({
  clock: scheduleToastRemovalFx.doneData,
  target: toastDismissedFn,
})

// ПОИСК

sample({
  clock: debounce({
    source: searchChangedFn,
    timeout: SEARCH_DEBOUNCE_MS,
  }),
  target: searchFetchFn,
})

/** При изменении поиска/сортировки/страницы — перезапросить товары */
sample({
  clock: [productsPageOpenedFn, searchFetchFn, sortChangedFn, pageChangedFn, handleRefreshFn],
  source: combine({
    query: $search,
    sort: $sort,
    currentPage: $currentPage,
  }),
  fn: ({ query, sort, currentPage }) => ({
    query,
    sort,
    limit: PAGE_SIZE,
    skip: (currentPage - 1) * PAGE_SIZE,
  }),
  target: fetchProductsFx,
})

// ============================ EXPORT ========================= //

export {
  $currentPage,
  $editorState,
  $isProductsLoading,
  $productsError,
  $productsMetrics,
  $search,
  $sort,
  $toasts,
  createProductRequestedFn,
  editProductRequestedFn,
  editorClosedFn,
  pageChangedFn,
  productForm,
  productFormSubmittedFn,
  productsPageOpenedFn,
  searchChangedFn,
  handleRefreshFn,
  sortChangedFn,
  toastDismissedFn,
}

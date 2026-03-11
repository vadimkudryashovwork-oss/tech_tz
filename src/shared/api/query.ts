import { config } from '@/shared/config/common'
import type {
  ApiErrorPayload,
  ApiLoginResponse,
  ApiProductDto,
  ApiProductsResponse,
} from '@/shared/api/contracts'
import {
  apiErrorPayloadSchema,
  apiLoginResponseSchema,
  apiProductsResponseSchema,
} from '@/shared/api/contracts'
import type { AuthSession, PersistedSession } from '@/shared/types/auth'
import type { Product, ProductList, ProductSort } from '@/shared/types/product'
import type { ZodType } from 'zod'

const DUMMY_JSON_AUTH = 'https://dummyjson.com/auth/login'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getErrorMessage(payload: unknown) {
  const parsed = apiErrorPayloadSchema.safeParse(payload)

  if (parsed.success && parsed.data.message) {
    return parsed.data.message
  }

  return 'Сервис временно недоступен. Повторите попытку позже.'
}

function parsePayload<T>(
  schema: ZodType<T>,
  payload: unknown,
  status: number,
  fallbackMessage: string,
): T {
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    throw new ApiError(fallbackMessage, status)
  }

  return parsed.data
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function mapLoginResponseToAuthSession(payload: ApiLoginResponse): AuthSession {
  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      gender: payload.gender,
      image: payload.image,
    },
  }
}

function mapLoginResponseToPersistedSession(
  payload: ApiLoginResponse,
  remember: boolean,
): PersistedSession {
  return {
    ...mapLoginResponseToAuthSession(payload),
    remember,
  }
}

function mapProduct(dto: ApiProductDto): Product {
  return {
    id: dto.id,
    title: dto.title,
    category: dto.category,
    price: dto.price,
    rating: dto.rating,
    stock: dto.stock,
    brand: normalizeText(dto.brand),
    sku: normalizeText(dto.sku),
    thumbnail: dto.thumbnail ?? '',
  }
}

function mapProductList(payload: ApiProductsResponse): ProductList {
  return {
    products: payload.products.map(mapProduct),
    total: payload.total,
    skip: payload.skip,
    limit: payload.limit,
  }
}

// ======================== BASE ======================== //

async function request<T>(path: string, schema: ZodType<T>, init?: RequestInit) {
  const response = await fetch(`${config.API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | T | null

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload), response.status)
  }

  return parsePayload(
    schema,
    payload,
    response.status,
    'Сервис вернул данные в неожиданном формате. Повторите попытку позже.',
  )
}

// ======================== AUTH ======================== //

/** Логин через DummyJSON. Сессия сохраняется в effector-storage (auth model). */
export async function loginRequest(payload: {
  username: string
  password: string
  remember: boolean
}): Promise<PersistedSession> {
  const expiresInMins = payload.remember ? 60 * 24 * 7 : 60

  const response = await fetch(DUMMY_JSON_AUTH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: payload.username,
      password: payload.password,
      expiresInMins,
    }),
  })

  const data = (await response.json().catch(() => null)) as ApiErrorPayload | ApiLoginResponse | null

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status)
  }

  const parsedData = parsePayload(
    apiLoginResponseSchema,
    data,
    response.status,
    'Сервис авторизации вернул данные в неожиданном формате.',
  )

  return mapLoginResponseToPersistedSession(parsedData, payload.remember)
}

// ======================== PRODUCTS ======================== //

/** Загрузка товаров (DummyJSON) */
export async function fetchProductsRequest(params: {
  query: string
  sort: ProductSort
  limit: number
  skip: number
}): Promise<ProductList> {
  const search = params.query.trim()
  const endpoint = search ? '/products/search' : '/products'
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    skip: String(params.skip),
    select: config.API_PRODUCT_FIELDS,
    sortBy: params.sort.field,
    order: params.sort.order,
  })

  if (search) {
    searchParams.set('q', search)
  }

  const payload = await request(`${endpoint}?${searchParams.toString()}`, apiProductsResponseSchema)
  return mapProductList(payload)
}

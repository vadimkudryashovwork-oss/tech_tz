import { z } from 'zod'

export const apiErrorPayloadSchema = z.object({
  message: z.string().optional(),
})

export const apiLoginResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string(),
  image: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const apiProductDtoSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  price: z.number(),
  rating: z.number(),
  stock: z.number(),
  brand: z.string().nullish(),
  sku: z.string().nullish(),
  thumbnail: z.string().nullish(),
})

export const apiProductsResponseSchema = z.object({
  products: z.array(apiProductDtoSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
})

export type ApiErrorPayload = z.infer<typeof apiErrorPayloadSchema>
export type ApiLoginResponse = z.infer<typeof apiLoginResponseSchema>
export type ApiProductDto = z.infer<typeof apiProductDtoSchema>
export type ApiProductsResponse = z.infer<typeof apiProductsResponseSchema>

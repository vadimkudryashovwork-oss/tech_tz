/**
 * Контракт для валидации сессии из effector-storage.
 */
import { config } from '@/shared/config/common'
import type { PersistedSession } from '@/shared/types/auth'
import { z } from 'zod'

export const SESSION_STORAGE_KEY = `${config.APP_NAME}/session`

const persistedSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  remember: z.boolean(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    gender: z.string(),
    image: z.string(),
  }),
})

export function isSession(raw: unknown): raw is PersistedSession {
  return persistedSessionSchema.safeParse(raw).success
}

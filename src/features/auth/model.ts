import { combine, createEffect, createEvent, createStore, sample } from 'effector'
import { createForm } from 'effector-forms'
import { persist } from 'effector-storage/local'
import { persist as persistSession } from 'effector-storage/session'
import { loginRequest } from '@/shared/api/query'
import { rules } from '@/shared/lib/rules'
import { appStartedFn } from '@/shared/config/init'
import type { AuthSession, PersistedSession } from '@/shared/types/auth'
import { isSession, SESSION_STORAGE_KEY } from './session-schema'

// ======================== TYPES ======================= //

interface AuthFormValues {
  username: string
  password: string
}

// ========================= INIT FORM ========================= //

const authForm = createForm<AuthFormValues>({
  fields: {
    username: {
      init: '',
      rules: [rules.required('Введите логин')],
    },
    password: {
      init: '',
      rules: [rules.required('Введите пароль')],
    },
  },
  validateOn: ['submit'],
})

// ====== INIT UNITS EVENTS / STORES / EFFECTS / DERIVED ======= //

/** Установка флага «Запомнить данные» */
const setRememberFn = createEvent<boolean>()

/** Выход из системы */
const logoutRequestedFn = createEvent<void>()

/** Сессия сохранена в storage (remember → localStorage, иначе → sessionStorage) */
const sessionSavedToStorageFn = createEvent<PersistedSession>()

/** Запрос логина на API */
const loginFx = createEffect(loginRequest)

/** Сессия в localStorage (remember=true), persist через effector-storage */
const $sessionLocal = createStore<PersistedSession | null>(null)
  .on(sessionSavedToStorageFn, (_, session) => (session.remember ? session : null))
  .reset(logoutRequestedFn)

/** Сессия в sessionStorage (remember=false), persist через effector-storage */
const $sessionSession = createStore<PersistedSession | null>(null)
  .on(sessionSavedToStorageFn, (_, session) => (!session.remember ? session : null))
  .reset(logoutRequestedFn)

/** Флаг «Запомнить данные» */
const $remember = createStore(false).on(setRememberFn, (_, v) => v)

/** Сообщение об ошибке логина */
const $authError = createStore('')
  .on(loginFx.failData, (_, error) => error.message)
  .reset(authForm.formValidated, logoutRequestedFn)

/** Флаг готовности сессии (pickup/логин завершён) */
const $isSessionReady = createStore(false)
  .on(appStartedFn, () => true)
  .on(loginFx.finally, () => true)

/** Текущая сессия (sessionStorage приоритетнее — вкладка, иначе localStorage) */
const $session = combine($sessionLocal, $sessionSession, (local, sess): AuthSession | null => {
  const current = sess ?? local

  if (!current) {
    return null
  }

  return {
    accessToken: current.accessToken,
    refreshToken: current.refreshToken,
    user: current.user,
  }
})

/** Есть ли активная сессия */
const $isAuthenticated = $session.map(Boolean)

// ======================= LOGIC OPERATORS ===================== //

persist({
  store: $sessionLocal,
  key: SESSION_STORAGE_KEY,
  contract: isSession,
  pickup: [appStartedFn],
})

persistSession({
  store: $sessionSession,
  key: SESSION_STORAGE_KEY,
  contract: isSession,
  pickup: [appStartedFn],
})

/** При успешном логине — сохранить в нужный storage (effector-storage) */
sample({
  clock: loginFx.doneData,
  target: sessionSavedToStorageFn,
})

/** При валидной форме логина — собрать данные с флагом remember и вызвать API логина */
sample({
  clock: authForm.formValidated,
  source: $remember,
  fn: (remember, values) => ({
    username: values.username.trim(),
    password: values.password,
    remember,
  }),
  target: loginFx,
})

/** При выходе — сбросить stores (persist очистит storage) и форму */
sample({
  clock: logoutRequestedFn,
  target: authForm.reset,
})

// ============================ EXPORT ========================= //

export {
  $authError,
  $isAuthenticated,
  $isSessionReady,
  $remember,
  $session,
  appStartedFn,
  authForm,
  logoutRequestedFn,
  setRememberFn,
}

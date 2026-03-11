import type { Rule } from 'effector-forms'

function trimValue(value: unknown): string {
  if (value == null) return ''
  const s = String(value)
  return s.trim()
}

const rules = {
  required: (errorText?: string): Rule<string, Record<string, string>> => ({
    name: 'required',
    validator: (value) => {
      const val = trimValue(value)
      const isValid = value != null && val !== '' && val.length > 0
      return {
        isValid: !!isValid,
        errorText: errorText ?? 'Обязательное поле',
      }
    },
  }),

  minLength: (min: number, errorText?: string): Rule<string, Record<string, string>> => ({
    name: 'minLength',
    validator: (value) => {
      const s = String(value ?? '')
      const isValid = s.length >= min
      return {
        isValid,
        errorText: errorText ?? `Минимальная длина ${min} символов`,
      }
    },
  }),

  maxLength: (max: number, errorText?: string): Rule<string, Record<string, string>> => ({
    name: 'maxLength',
    validator: (value) => {
      const s = String(value ?? '')
      const isValid = s.length <= max
      return {
        isValid,
        errorText: errorText ?? `Максимальная длина ${max} символов`,
      }
    },
  }),

  email: (): Rule<string, Record<string, string>> => ({
    name: 'email',
    validator: (value) => {
      const pattern = /\S+@\S+\.\S+/
      const isValid = pattern.test(String(value ?? ''))
      return {
        isValid,
        errorText: 'Некорректный email',
      }
    },
  }),

  number: (errorText?: string): Rule<string, Record<string, string>> => ({
    name: 'number',
    validator: (value) => {
      const s = String(value ?? '').trim()
      const isValid = s === '' || (Number.isFinite(Number(s)) && !Number.isNaN(Number(s)))
      return {
        isValid,
        errorText: errorText ?? 'Введите число',
      }
    },
  }),

  min: (min: number, errorText?: string): Rule<string, Record<string, string>> => ({
    name: 'min',
    validator: (value) => {
      const num = Number(value)
      const isValid = Number.isFinite(num) && num >= min
      return {
        isValid,
        errorText: errorText ?? `Минимальное значение ${min}`,
      }
    },
  }),

  price: (errorText?: string): Rule<string, Record<string, string>> => ({
    name: 'price',
    validator: (value) => {
      const num = Number(value)
      const isValid = Number.isFinite(num) && num > 0
      return {
        isValid,
        errorText: errorText ?? 'Цена должна быть больше 0',
      }
    },
  }),
}

export { rules }

import { useState } from 'react'
import { useUnit } from 'effector-react'
import { onSubmit } from '@/shared/lib/form'
import { $authError, $remember, setRememberFn } from '@/features/auth/model'
import { authForm } from '@/features/auth/model'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Checkbox } from '@/shared/ui/Checkbox'
import { FormInput } from '@/shared/ui/FormInput'
import {
  CloseIcon,
  UserIcon,
  LockIcon,
  EyeOffIcon,
  EyeIcon,
  LogoIcon,
  OryIcon,
} from '@/shared/ui/icons'

function LoginPage() {
  const [apiError, remember, setRemember] = useUnit([$authError, $remember, setRememberFn])
  const [showPassword, setShowPassword] = useState(false)
  const [usernameValue] = useUnit([authForm.fields.username.$value])

  return (
    <main className="auth-layout">
      <Card className="auth-card">
        <div className="auth-card__inner">
          <div className="auth-card__logo">
            <LogoIcon />
          </div>
          <div className="auth-card__header">
            <h1>Добро пожаловать!</h1>
            <p>Пожалуйста, авторизируйтесь</p>
          </div>
          <form className="auth-form" onSubmit={onSubmit(() => authForm.submit())}>
            <div className="auth-form__fields">
              <div className="field field--form">
                <FormInput
                  field={authForm.fields.username}
                  name="username"
                  label="Логин"
                  placeholder="test"
                  autoComplete="username"
                  icon={<UserIcon width={24} height={24} />}
                  trailing={
                    usernameValue ? (
                      <button
                        type="button"
                        className="field__action"
                        onClick={() => authForm.fields.username.onChange('')}
                        aria-label="Очистить"
                      >
                        <CloseIcon width={14} height={16} />
                      </button>
                    ) : null
                  }
                />
              </div>
              <div className="field field--form">
                <FormInput
                  field={authForm.fields.password}
                  name="password"
                  label="Пароль"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="•••••••••••••"
                  autoComplete="current-password"
                  icon={<LockIcon width={24} height={24} />}
                  trailing={
                    <button
                      type="button"
                      className="field__action"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {showPassword ? (
                        <EyeIcon width={24} height={24} />
                      ) : (
                        <EyeOffIcon width={24} height={24} />
                      )}
                    </button>
                  }
                />
              </div>
            </div>
            <Checkbox
              label="Запомнить данные"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            {apiError ? <p className="auth-form__error">{apiError}</p> : null}
            <Button type="submit" className="auth-form__submit">
              Войти
            </Button>
            <div className="auth-form__divider">
              <OryIcon aria-label="или" role="img" />
            </div>
          </form>
          <div className="auth-card__footer">
            Нет аккаунта?{' '}
            <a href="#" className="auth-card__footer-link" onClick={(e) => e.preventDefault()}>
              Создать
            </a>
          </div>
        </div>
      </Card>
    </main>
  )
}

export { LoginPage }

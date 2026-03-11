# ITGuru Products Admin — документация

## Стек технологий

| Категория      | Технологии                                                                 |
|----------------|----------------------------------------------------------------------------|
| **UI**         | React 19, TypeScript                                                       |
| **Сборка**     | Vite 7                                                                     |
| **Стейт**      | Effector, effector-react, effector-forms, effector-storage, patronum       |
| **API**        | DummyJSON (auth + products), Zod для runtime-валидации границ              |
| **Стили**      | Кастомный CSS (без Tailwind, Material UI и т.п.)                           |
| **Линтинг**    | ESLint, Prettier                                                           |

### Основные зависимости

- **effector** — управление состоянием
- **effector-forms** — формы и валидация
- **effector-storage** — персистенция в localStorage/sessionStorage
- **patronum** — утилиты для Effector (debounce и др.)
- **zod** — runtime-валидация ответов API и данных из storage

---

## Запуск проекта

### Установка и dev-режим

```bash
npm install
npm run dev
```

Приложение откроется на `http://localhost:5173` (или другом порту Vite).

### Сборка и предпросмотр

```bash
npm run build
npm run preview
```

### Демо-логин

- **username**: `emilys`
- **password**: `emilyspass`

### Переменные окружения

Создайте `.env` по образцу `.env.example`:

```
VITE_API_BASE_URL=https://dummyjson.com
```

По умолчанию используется `https://dummyjson.com`, если переменная не задана.

---

## Структура проекта

```
itguru/
├── index.html              # Точка входа HTML
├── package.json
├── vite.config.ts          # Конфиг Vite, алиас @
├── tsconfig.json
├── .env.example
│
├── public/                 # Статика, копируемая в build без обработки
│   ├── fonts/
│   └── icons/
│
├── src/
│   ├── app/                # Корневой слой приложения
│   │   ├── main.tsx        # Точка входа React
│   │   ├── application.tsx # Корневой компонент, роутинг по auth
│   │   └── styles/
│   │       └── index.css   # Импорт глобальных стилей
│   │
│   ├── features/           # Фичи (доменная логика + UI)
│   │   ├── auth/           # Авторизация
│   │   │   ├── model.ts
│   │   │   └── session-schema.ts
│   │   └── products/       # Товары
│   │       ├── model.ts
│   │       ├── ProductFormDialog.tsx
│   │       ├── columns-schema.ts
│   │       └── sort-schema.ts
│   │
│   ├── pages/              # Страницы
│   │   ├── LoginPage.tsx
│   │   └── ProductsPage/
│   │       ├── ProductsPage.tsx
│   │       ├── children/
│   │       │   ├── Header.tsx
│   │       │   └── Content/
│   │       │       ├── Content.tsx
│   │       │       └── children/
│   │       │           ├── Add.tsx
│   │       │           └── Data.tsx
│   │
│   └── shared/             # Переиспользуемый код
│       ├── api/
│       │   ├── contracts.ts # Zod-схемы и transport-контракты API
│       │   └── query.ts     # Запросы к API + маппинг transport -> domain
│       ├── config/
│       │   ├── common.ts   # Константы (API_BASE_URL, PAGE_SIZE и т.д.)
│       │   └── init.ts     # Событие appStartedFn
│       ├── lib/
│       │   ├── cn.ts       # Утилита classnames
│       │   ├── form.ts
│       │   ├── format.ts   # Форматирование (например, цен)
│       │   └── rules.ts    # Правила валидации форм
│       ├── styles/
│       │   ├── globals.css
│       │   └── design-tokens.css
│       ├── types/
│       │   ├── auth.ts     # Доменные и persistent-типы авторизации
│       │   ├── product.ts  # Доменные типы товаров, формы и сортировки
│       │   └── toast.ts    # Нейтральный тип toast-сообщения
│       └── ui/             # UI-компоненты
│           ├── Button.tsx
│           ├── Card.tsx
│           ├── Checkbox.tsx
│           ├── FormInput.tsx
│           ├── Input.tsx
│           ├── Modal.tsx
│           ├── Pagination.tsx
│           ├── ProgressBar.tsx
│           ├── ToastViewport.tsx
│           └── icons.tsx
```

---

## Описание разделов

### `src/app`

- **main.tsx** — монтирует React в `#root`, подключает стили, вызывает `appStartedFn`, нормализует URL (например, `/login` → `/`).
- **application.tsx** — корневой компонент: проверяет `$isSessionReady` и `$isAuthenticated`, показывает сплэш при инициализации сессии, затем либо `LoginPage`, либо `ProductsPage`. Глобально рендерит `ToastViewport`.

### `src/features/auth`

- **model.ts** — логика авторизации: вызов `loginRequest`, хранение сессии через effector-storage (`localStorage` при «Запомнить меня», `sessionStorage` иначе), выделение текущей `AuthSession`, события выхода.
- **session-schema.ts** — runtime-валидация persisted session через Zod перед чтением из storage.

### `src/features/products`

- **model.ts** — основная модель товаров: загрузка, поиск (debounce), сортировка, пагинация, локальное добавление/редактирование, toasts.
- **ProductFormDialog.tsx** — модалка создания/редактирования товара.
- **columns-schema.ts** — конфигурация колонок таблицы и формы на строгих union-типах.
- **sort-schema.ts** — схема сортировки и её runtime-валидация для persist в localStorage.

### `src/pages`

- **LoginPage** — форма входа (username, password, «Запомнить меня»), валидация через effector-forms.
- **ProductsPage** — страница товаров:
  - **Header** — поиск, кнопка выхода.
  - **Content** — карточка с таблицей, прогресс-бар, пагинация, кнопка добавления.
  - **Data** — таблица товаров, сортировка по колонкам, чекбоксы, действия (редактировать).
  - **Add** — кнопка «Добавить позицию».

### `src/shared`

- **api/contracts.ts** — Zod-схемы и transport-типы (`ApiLoginResponse`, `ApiProductDto`, `ApiProductsResponse`).
- **api/query.ts** — `loginRequest`, `fetchProductsRequest`, `ApiError`, парсинг ответов и маппинг transport -> domain.
- **config/common.ts** — `API_BASE_URL`, `PAGE_SIZE`, `TOAST_DURATION_MS`, `SEARCH_DEBOUNCE_MS` и др.
- **lib/** — утилиты (`cn`, `format`, `rules` для валидации).
- **styles/** — глобальные стили и design tokens.
- **types/** — доменные и нейтральные типы (`auth`, `product`, `toast`), не привязанные к UI или transport-слою.
- **ui/** — переиспользуемые UI-компоненты без внешних UI-библиотек.

---

## Типизация и границы данных

- Сырые ответы API не используются напрямую в модели и UI: сначала они валидируются Zod-схемами из `src/shared/api/contracts.ts`.
- После валидации данные нормализуются в domain-типы в `src/shared/api/query.ts`.
- Доменные типы отделены от transport- и persistence-типов:
  - `src/shared/types/auth.ts` — `AuthSession`, `PersistedSession`
  - `src/shared/types/product.ts` — `Product`, `ProductDraft`, `ProductEditorForm`, `ProductSort`
  - `src/shared/types/toast.ts` — `ToastItem`
- Данные из `localStorage/sessionStorage` тоже проходят runtime-проверку перед использованием.

---

## API

- **Auth**: [DummyJSON Auth](https://dummyjson.com/docs/auth)
- **Products**: [DummyJSON Products](https://dummyjson.com/docs/products)

---

## Скрипты

| Команда           | Описание                              |
|-------------------|---------------------------------------|
| `npm run dev`     | Запуск dev-сервера Vite               |
| `npm run build`   | Production-сборка                     |
| `npm run preview` | Предпросмотр собранного приложения    |
| `npm run lint`    | Запуск ESLint                         |
| `npm run format`  | Форматирование Prettier               |
| `npm run format:check` | Проверка форматирования          |

---

## Комментарии автора

1. В проекте есть несколько деталей, которых нет напрямую на макете, но они добавлены осознанно для удобства использования:
- кнопка выхода
- подсветка строк в таблице
- текущее расположение строки поиска

2. Окно редактирования товара открывается как по кнопке с троеточием, так и по кнопке `+` в строке таблицы.

3. Так как в приложении всего две страницы, отдельный router я посчитал избыточным и не добавлял его.

4. В качестве state management выбран Effector. Для меня это не просто хранилище состояния, а инструмент описания бизнес-логики, где store является только одной из частей. У него достаточно простой и при этом выразительный API, который позволяет держать логику отдельно от view-слоя. Благодаря этому можно независимо развивать UI и бизнес-логику с меньшим риском побочных поломок.

5. Для UI использованы кастомные компоненты по следующим причинам:
- для двух экранов подключение полноценного UI-kit выглядело бы избыточным
- все компоненты находятся под полным контролем проекта
- отсутствие жёсткой привязки к конкретному UI-kit упрощает дальнейшие изменения и потенциальную миграцию на другой стек

6. AI в проекте использовался:
- для получения базовых стилей и параметров из Figma через MCP, после чего они были доработаны вручную
- для части комментариев в коде и для части текста в README

     
   

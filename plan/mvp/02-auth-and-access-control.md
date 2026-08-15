# 02. Авторизація і контроль доступу

## Статус
потребує локальної перевірки

## Зв'язок з roadmap
Походить з розділу `1. Авторизація` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): код живе переважно у `src/features/auth`, `src/shared/auth`, `src/app/(auth)` і `src/app/(app)`.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)

## Підзадачі
- [x] Налаштувати Supabase Auth для входу email+пароль
- [x] Реалізувати login route segment і захищений app layout
- [x] Заблокувати self-signup у конфігурації auth
- [x] Додати membership guard на основі `public.profiles`
- [x] Визначити й задокументувати процедуру створення першого користувача: власник проєкту вручну створює Auth-user і запис у `public.profiles`
- [x] Зафіксувати, що пароль не зберігається й не хешується в коді застосунку або міграціях; це робить Supabase Auth
- [x] Забезпечити збереження сесії між візитами
- [x] Покрити edge cases: auth є, але `profiles` запису немає
- [x] Додати або оновити інтеграційні тести для auth flow і membership access

## Acceptance criteria
- [x] Вхід через email+пароль (Supabase Auth)
- [x] Без входу — недоступні жодні дані (редірект на сторінку логіну)
- [x] Сесія зберігається (не треба логінитись щоразу)
- [x] Реєстрація нових користувачів вимкнена; доступ додається вручну
- [x] Перший користувач створюється окремою процедурою bootstrap, а не через дефолтні креденшіали в коді чи міграціях
- [x] Наявність auth-акаунта сама по собі не дає доступу — потрібен запис у `public.profiles`
- [x] Користувач не може самостійно додати себе або інших у `public.profiles`
- [x] RLS-політики перевіряють наявність `auth.uid()` у `public.profiles`
- [x] Усі користувачі з `profiles` мають однаковий доступ до спільної колекції
- [x] У доменних таблицях немає `owner_id`

## Нотатки з реалізації
- 2026-08-14: Додано мінімальний Next.js App Router scaffold для auth-кроку: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/(auth)/*`, `src/app/(app)/*`, `globals.css`, `proxy.ts`, `next.config.ts`, `tsconfig.json`.
- 2026-08-14: Реалізовано Supabase SSR helpers у `src/shared/supabase/*`, membership access resolution у `src/shared/auth/access.ts`, login/logout server actions і guarded redirects для анонімного користувача та користувача без `public.profiles`.
- 2026-08-14: `supabase/config.toml` і надалі тримає `enable_signup = false`, а bootstrap першого користувача документовано через `docs/bootstrap-first-user.md` без фіксованих облікових даних.
- 2026-08-14: Додано інтеграційні тести для auth redirect logic і login action helpers у `tests/integration/auth/*`, а CI workflow оновлено на `npm run test:integration`.
- 2026-08-14: Локальна перевірка кроку не виконана в цьому середовищі, бо тут не встановлені нові npm-залежності і не запускався Next.js runtime після змін; перед позначенням кроку як `завершено` потрібен локальний `npm install` і прогін тестів.

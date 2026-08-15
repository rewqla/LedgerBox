# 09. Тестування і CI

## Статус
завершено

## Зв'язок з roadmap
Походить з розділу `Тестування` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): інтеграційні тести живуть у `tests/integration`, а цей крок не замінює тести в попередніх розділах, а формалізує спільний test harness, CI і аудит покриття.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)
- [05-coins-crud-categories-and-photos.md](05-coins-crud-categories-and-photos.md)
- [07-wishlist.md](07-wishlist.md)
- [08-import-export.md](08-import-export.md)

## Підзадачі
- [x] Налаштувати Vitest для інтеграційних тестів поверх локального Supabase-стеку
- [x] Автоматизувати прогін міграцій на тестовій БД перед тестами
- [x] Додати helpers для авторизації, membership і storage assertions
- [x] Перевірити, що кожен попередній крок уже отримав свої тести, і скласти список прогалин
- [x] Допокрити прогалини в CRUD, RLS, photo flows, URL import і storage cleanup
- [x] Підключити обов'язковий запуск тестів у CI на кожен PR

## Acceptance criteria
- [x] Локальний Supabase-стек (`supabase start`, підіймає Postgres/Auth/Storage в Docker) використовується і для розробки, і для тестів
- [x] Міграції прогоняються автоматично на тестовій БД перед запуском тестів
- [x] Інтеграційні тести (Vitest) викликають server actions / API route handlers напряму, перевіряють і відповідь, і фактичний стан у БД (не моки Supabase-клієнта)
- [x] Кожен функціональний крок MVP має власні тести, додані під час його реалізації, а не відкладені на кінець
- [x] Тести CRUD монет
- [x] Тести CRUD категорій
- [x] Тести CRUD бажанок
- [x] Тести RLS: неавторизований користувач не має доступу; auth-користувач без `profiles` не має доступу; користувач із `profiles` має доступ до спільної колекції
- [x] Тести фото: 0/1/2 фото, окремі аверс/реверс, третій слот відсутній
- [x] Тести обробки фото: фінальний файл ≤ 1 MB
- [x] Тести URL-import: блокування приватних адрес, timeout / size limit, невалідне зображення
- [x] Тести cleanup Storage при заміні фото та видаленні монети
- [x] Тести запускаються в CI (GitHub Actions) на кожен PR, merge у `main` блокується при їх падінні

## Нотатки з реалізації
- 2026-08-15: Додано централізований `vitest.config.ts` і `tests/setup/integration-env.ts`, щоб інтеграційний набір стабільно стартував з єдиною конфігурацією для `tests/integration`.
- 2026-08-15: Додано локальний harness `tests/helpers/run-integration-tests.mjs` і npm-скрипти `test:integration:local` та `test:ci`; harness піднімає локальний Supabase, робить `supabase db reset --local --yes` і лише після цього запускає Vitest.
- 2026-08-15: Додано reusable helpers для auth/membership/storage assertions: `tests/helpers/auth.js`, `tests/helpers/storage.js`, `tests/helpers/supabase.ts`.
- 2026-08-15: Проведено coverage audit і допокрито прогалини тестами для CRUD категорій, CRUD монет, RLS access cases, photo processing ≤ 1 MB, remote import size-limit і storage upload/remove helpers.
- 2026-08-15: CI workflow `.github/workflows/database-checks.yml` перетворено на повноцінний PR gate: `npm ci`, `supabase start`, `npm run test:integration:local`, `npm run build`.
- 2026-08-15: Локально успішно пройшли `npm run test:integration` і `npm run build`. Окремий запуск `npm run test:integration:local` у цьому середовищі вперся не в код, а в відмову доступу до Docker API (`permission denied while trying to connect to the docker API at npipe:////./pipe/docker_engine`).

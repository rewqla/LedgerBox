# 09. Тестування і CI

## Статус
не розпочато

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
- [ ] Налаштувати Vitest для інтеграційних тестів поверх локального Supabase-стеку
- [ ] Автоматизувати прогін міграцій на тестовій БД перед тестами
- [ ] Додати helpers для авторизації, membership і storage assertions
- [ ] Перевірити, що кожен попередній крок уже отримав свої тести, і скласти список прогалин
- [ ] Допокрити прогалини в CRUD, RLS, photo flows, URL import і storage cleanup
- [ ] Підключити обов'язковий запуск тестів у CI на кожен PR

## Acceptance criteria
- [ ] Локальний Supabase-стек (`supabase start`, підіймає Postgres/Auth/Storage в Docker) використовується і для розробки, і для тестів
- [ ] Міграції прогоняються автоматично на тестовій БД перед запуском тестів
- [ ] Інтеграційні тести (Vitest) викликають server actions / API route handlers напряму, перевіряють і відповідь, і фактичний стан у БД (не моки Supabase-клієнта)
- [ ] Кожен функціональний крок MVP має власні тести, додані під час його реалізації, а не відкладені на кінець
- [ ] Тести CRUD монет
- [ ] Тести CRUD категорій
- [ ] Тести CRUD бажанок
- [ ] Тести RLS: неавторизований користувач не має доступу; auth-користувач без `profiles` не має доступу; користувач із `profiles` має доступ до спільної колекції
- [ ] Тести фото: 0/1/2 фото, окремі аверс/реверс, третій слот відсутній
- [ ] Тести обробки фото: фінальний файл ≤ 1 MB
- [ ] Тести URL-import: блокування приватних адрес, timeout / size limit, невалідне зображення
- [ ] Тести cleanup Storage при заміні фото та видаленні монети
- [ ] Тести запускаються в CI (GitHub Actions) на кожен PR, merge у `main` блокується при їх падінні

## Нотатки з реалізації


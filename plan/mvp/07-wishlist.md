# 07. Бажанки

## Статус
завершено

## Зв'язок з roadmap
Походить з розділу `5. Розділ "Бажанки" (вішлист)` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): wishlist живе в `src/features/coins/wishlist`, бо в БД це `coins.wishlist_items`.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)
- [03-app-shell-and-navigation.md](03-app-shell-and-navigation.md)

## Підзадачі
- [x] Реалізувати CRUD для wishlist items у межах `src/features/coins/wishlist`
- [x] Додати окремий список бажанок відокремлено від колекції
- [x] Реалізувати дію "придбано" як прибирання запису зі списку
- [x] Окремо зафіксувати рішення, чи робити one-click transfer у межах MVP, чи лишити як stretch
- [x] Додати або оновити інтеграційні тести для wishlist flows цього кроку

## Acceptance criteria
- [x] Додати запис: назва монети (обов'язково), URL на товар (обов'язково), орієнтовна середня ціна (опційно) — без фото, wishlist навмисно текстовий
- [x] Список бажанок окремо від основної колекції
- [x] Видалити / позначити як "придбано" (просто прибирає зі списку)
- [x] Перенесення в колекцію одним кліком — бажано, але не критично для MVP

## Нотатки з реалізації
- 2026-08-14: Реалізовано wishlist slice у `src/features/coins/wishlist` з окремими `helpers`, `queries`, `actions`, `form-state` і client-side `WishlistManager` без змішування з колекцією монет.
- 2026-08-14: Маршрут `src/app/(app)/coins/wishlist/page.tsx` тепер рендерить реальний окремий список бажанок із create/update/delete flow та дією `Придбано`, яка просто видаляє запис зі списку.
- 2026-08-14: У межах MVP свідомо зафіксовано рішення лишити one-click transfer з wishlist у collection як stretch, а не обов'язкову частину цього кроку; це прямо відображено в UX сторінки.
- 2026-08-14: Wishlist лишився навмисно текстовим: тільки назва, URL на товар і опційна орієнтовна ціна, без фото та storage-логіки.
- 2026-08-14: Додано тести для wishlist helpers і CRUD-стану таблиці `coins.wishlist_items` у `tests/integration/wishlist/helpers.test.ts` та `tests/integration/wishlist/database.test.js`; локально успішно пройшли `npm run test:integration` і `npm run build`.

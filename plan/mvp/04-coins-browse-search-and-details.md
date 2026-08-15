# 04. Монети: перегляд, пошук і детальна картка

## Статус
завершено

## Зв'язок з roadmap
Походить з розділу `2. Розділ "Монети" — перегляд і пошук` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): код живе у `src/features/coins/collection`, а спільні примітиви лише в `src/shared/ui` та `src/shared/lib`.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)
- [03-app-shell-and-navigation.md](03-app-shell-and-navigation.md)

## Підзадачі
- [x] Реалізувати collection page з двома режимами відображення
- [x] Додати read queries для списку й детальної картки монети
- [x] Реалізувати пошук за назвою
- [x] Зафіксувати правило, що пошукова логіка належить тільки `src/features/coins/collection` і не виноситься в reusable shared helper без окремої потреби
- [x] Дозволити реюз лише presentation-компонентів або стилів пошуку, але не доменної query/filter логіки
- [x] Реалізувати фільтри за роком, категорією і дорогоцінним металом
- [x] Підключити збереження view mode між сесіями
- [x] Підготувати UI для 0/1/2 фото з окремими слотами аверс/реверс
- [x] Додати або оновити інтеграційні та UI-тести для browse/search/filter flows

## Acceptance criteria
- [x] Список усіх монет у двох режимах відображення: картки (фото + назва + рік) і таблиця
- [x] Перемикання вигляду зберігається (localStorage / налаштування користувача)
- [x] Пошук за назвою
- [x] Пошукова логіка залишається специфічною для фічі монет і не реюзається між доменами
- [x] Фільтр за роком, категорією та дорогоцінним металом
- [x] Клік на монету відкриває детальну картку з усіма полями
- [x] Монета може мати 0, 1 або 2 фото: окремі слоти для аверсу та реверсу
- [x] Третє фото додати неможливо, оскільки окремої галереї / таблиці фото в MVP немає
- [x] Кожен кінцевий файл фото у Storage ≤ 1 MB

## Нотатки з реалізації
- 2026-08-14: У `src/features/coins/collection/server/*` додано доменні типи, нормалізацію search params і read-queries для списку монет, фільтрів та детальної картки.
- 2026-08-14: `src/app/(app)/coins/collection/page.tsx` підключено до реальних filters/query flows; реалізовано пошук за назвою, фільтри за роком, категорією і дорогоцінним статусом.
- 2026-08-14: У `src/features/coins/collection/ui/collection-browser.tsx` додано cards/table режими з persisted view mode через `localStorage` (`ledgerbox:coins:collection:view-mode`).
- 2026-08-14: Додано detail route `src/app/(app)/coins/collection/[coinId]/page.tsx` і UI для двох окремих photo slots (аверс/реверс) без окремої галереї чи третього слоту.
- 2026-08-14: Пошукова та фільтраційна логіка залишена всередині `src/features/coins/collection` і покрита тестами в `tests/integration/collection/filters.test.ts`; локально успішно пройшли `npm run test:integration` і `npm run build`.

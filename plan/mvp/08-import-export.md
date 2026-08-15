# 08. Імпорт і експорт монет

## Статус
завершено

## Зв'язок з roadmap
Походить з розділу `6. Розділ "Монети" — імпорт / експорт` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): код живе у `src/features/coins/import-export`, а shared-шар торкається лише загальних validation/file helpers за реальної потреби.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)
- [05-coins-crud-categories-and-photos.md](05-coins-crud-categories-and-photos.md)

## Підзадачі
- [x] Визначити фінальний формат MVP import/export перед реалізацією
- [x] Спроєктувати схему валідації імпортованих записів
- [x] Визначити стратегію повторного імпорту / дедуплікації
- [x] Реалізувати експорт усієї спільної колекції
- [x] Реалізувати імпорт із поелементним звітом помилок без падіння всього процесу
- [x] Явно виключити фото з переносимого payload
- [x] Додати або оновити інтеграційні тести для import/export flows цього кроку

## Acceptance criteria
- [x] Експорт усієї спільної колекції у файл
- [x] Формат визначити перед реалізацією; базовий кандидат — JSON, CSV можна додати окремо для табличного редагування
- [x] Імпорт монет із файлу назад у колекцію
- [x] Валідація імпортованих даних перед записом у БД
- [x] Некоректні записи не ламають імпорт повністю; показується звіт, що саме не імпортовано
- [x] Фото не входять в import/export MVP — тільки текстові поля і шляхи не використовуються як переносимі файли
- [x] Перед реалізацією визначити поведінку повторного імпорту / дублювання записів

## Нотатки з реалізації
- 2026-08-14: Для MVP зафіксовано JSON як єдиний формат import/export. Payload має явний контракт `ledgerbox.coins.export`, `version: 1`, `photoPolicy: "excluded"` і `duplicatePolicy: "skip-on-import"`, щоб поведінка була стабільною до появи CSV або merge-режимів.
- 2026-08-14: У `src/features/coins/import-export/server/helpers.ts` додано окрему схему валідації імпортованих монет без залежності від internal helpers інших фіч. Перевіряються всі MVP-поля монети, а photo paths і фото-дані явно відхиляються.
- 2026-08-14: Повторний імпорт реалізовано без merge/update логіки: дублікати визначаються за стабільним signature запису і пропускаються з позначкою `skipped` у звіті імпорту.
- 2026-08-14: Додано route `src/app/(app)/coins/collection/import-export/page.tsx` та UI `src/features/coins/import-export/ui/import-export-panel.tsx` для завантаження JSON і перегляду поелементного звіту `imported / skipped / error`.
- 2026-08-14: Додано API route `src/app/api/coins/collection/export/route.ts`, який віддає весь shared collection у файл `ledgerbox-coins-export.json` без фото та без storage-paths.
- 2026-08-14: Імпорт створює відсутні категорії за `categoryName`, але не переносить фото і не використовує ID чи storage-шляхи як переносимі дані.
- 2026-08-14: Додано тести для payload contract, photo exclusion, validation, dedup signature і summary aggregation у `tests/integration/import-export/helpers.test.ts`; локально успішно пройшли `npm run test:integration` і `npm run build`.

# 05. Монети: CRUD, категорії і фото

## Статус
завершено

## Зв'язок з roadmap
Походить з розділу `3. Розділ "Монети" — адміністрування (CRUD)` та блоку `Файлове сховище — деталі` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): код живе у `src/features/coins/collection`, `src/features/coins/categories`, `src/features/coins/photos`; shared-код лише для Supabase/storage infrastructure.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)
- [03-app-shell-and-navigation.md](03-app-shell-and-navigation.md)
- [04-coins-browse-search-and-details.md](04-coins-browse-search-and-details.md)

## Підзадачі
- [x] Реалізувати create/update/delete форми та server actions для монет
- [x] Додати client-side pipeline обробки локальних фото до WebP ≤ 1 MB
- [x] Додати backend endpoint/service для URL-import фото з усіма перевірками безпеки
- [x] Реалізувати окреме керування аверсом і реверсом
- [x] Додати cleanup Storage при заміні фото та видаленні монети
- [x] Реалізувати CRUD категорій із початковими значеннями та підтримкою довільного розширення
- [x] Додати або оновити інтеграційні тести для CRUD, storage cleanup і photo flows цього кроку

## Acceptance criteria
- [x] Додати монету через форму з усіма MVP-полями
- [x] Завантажити фото аверсу та/або реверсу локальним файлом
- [x] Імпортувати фото за URL через захищений backend endpoint
- [x] Редагувати монету
- [x] Замінити або видалити окремо фото аверсу / реверсу
- [x] При заміні фото старий файл коректно видаляється зі Storage
- [x] При видаленні монети її файли також видаляються зі Storage
- [x] Видалити монету з підтвердженням
- [x] Керування категоріями: додати / перейменувати категорію
- [x] Початкові категорії: "українська", "закордонна"
- [x] Довільні нові категорії додаються без зміни коду

## Нотатки з реалізації
- 2026-08-14: Додано create/edit/delete маршрути для монет: `src/app/(app)/coins/collection/new`, `src/app/(app)/coins/collection/[coinId]/edit`, а також `CoinForm` і server actions у `src/features/coins/collection/server/actions.ts`.
- 2026-08-14: Локальні фото тепер проходять client-side pipeline до WebP ≤ 1 MB у `src/features/coins/photos/client/process-local-photo.ts`, після чого server-side upload повторно перевіряє й зберігає їх у `coin-photos/{coin_id}/{slot}.webp`.
- 2026-08-14: Додано захищений backend endpoint `src/app/api/coins/photos/import/route.ts` і server-side URL import service з перевіркою `http/https`, блокуванням localhost/private/link-local адрес, timeout, redirect limit, size limit і обробкою через `sharp`.
- 2026-08-14: Реалізовано окреме керування слотами `obverse`/`reverse`, cleanup Storage при заміні фото та видаленні монети через `src/features/coins/photos/server/storage.ts`.
- 2026-08-14: Додано керування категоріями в `src/app/(app)/coins/collection/categories/page.tsx` з create/rename actions у `src/features/coins/categories/server/actions.ts`.
- 2026-08-14: Тести оновлено для coin form helpers і photo URL security (`tests/integration/collection/coin-form-helpers.test.ts`, `tests/integration/photos/security.test.ts`); локально успішно пройшли `npm run test:integration` і `npm run build`.

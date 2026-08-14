# 05. Монети: CRUD, категорії і фото

## Статус
не розпочато

## Зв'язок з roadmap
Походить з розділу `3. Розділ "Монети" — адміністрування (CRUD)` та блоку `Файлове сховище — деталі` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): код живе у `features/coins/collection`, `features/coins/categories`, `features/coins/photos`; shared-код лише для Supabase/storage infrastructure.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)
- [03-app-shell-and-navigation.md](03-app-shell-and-navigation.md)
- [04-coins-browse-search-and-details.md](04-coins-browse-search-and-details.md)

## Підзадачі
- [ ] Реалізувати create/update/delete форми та server actions для монет
- [ ] Додати client-side pipeline обробки локальних фото до WebP ≤ 1 MB
- [ ] Додати backend endpoint/service для URL-import фото з усіма перевірками безпеки
- [ ] Реалізувати окреме керування аверсом і реверсом
- [ ] Додати cleanup Storage при заміні фото та видаленні монети
- [ ] Реалізувати CRUD категорій із початковими значеннями та підтримкою довільного розширення
- [ ] Додати або оновити інтеграційні тести для CRUD, storage cleanup і photo flows цього кроку

## Acceptance criteria
- [ ] Додати монету через форму з усіма MVP-полями
- [ ] Завантажити фото аверсу та/або реверсу локальним файлом
- [ ] Імпортувати фото за URL через захищений backend endpoint
- [ ] Редагувати монету
- [ ] Замінити або видалити окремо фото аверсу / реверсу
- [ ] При заміні фото старий файл коректно видаляється зі Storage
- [ ] При видаленні монети її файли також видаляються зі Storage
- [ ] Видалити монету з підтвердженням
- [ ] Керування категоріями: додати / перейменувати категорію
- [ ] Початкові категорії: "українська", "закордонна"
- [ ] Довільні нові категорії додаються без зміни коду

## Нотатки з реалізації


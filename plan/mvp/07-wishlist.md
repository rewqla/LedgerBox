# 07. Бажанки

## Статус
не розпочато

## Зв'язок з roadmap
Походить з розділу `5. Розділ "Бажанки" (вішлист)` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): wishlist живе в `src/features/coins/wishlist`, бо в БД це `coins.wishlist_items`.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)
- [03-app-shell-and-navigation.md](03-app-shell-and-navigation.md)

## Підзадачі
- [ ] Реалізувати CRUD для wishlist items у межах `src/features/coins/wishlist`
- [ ] Додати окремий список бажанок відокремлено від колекції
- [ ] Реалізувати дію "придбано" як прибирання запису зі списку
- [ ] Окремо зафіксувати рішення, чи робити one-click transfer у межах MVP, чи лишити як stretch
- [ ] Додати або оновити інтеграційні тести для wishlist flows цього кроку

## Acceptance criteria
- [ ] Додати запис: назва монети (обов'язково), URL на товар (обов'язково), орієнтовна середня ціна (опційно) — без фото, wishlist навмисно текстовий
- [ ] Список бажанок окремо від основної колекції
- [ ] Видалити / позначити як "придбано" (просто прибирає зі списку)
- [ ] Перенесення в колекцію одним кліком — бажано, але не критично для MVP

## Нотатки з реалізації

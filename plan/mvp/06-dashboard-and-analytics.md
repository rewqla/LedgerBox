# 06. Dashboard і статистика

## Статус
не розпочато

## Зв'язок з roadmap
Походить з розділу `4. Dashboard / статистика` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): `app/(app)/dashboard` є compositional route, а coin-specific queries/read-models та віджети живуть у `features/coins/dashboard`.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)
- [03-app-shell-and-navigation.md](03-app-shell-and-navigation.md)
- [04-coins-browse-search-and-details.md](04-coins-browse-search-and-details.md)
- [05-coins-crud-categories-and-photos.md](05-coins-crud-categories-and-photos.md)

## Підзадачі
- [ ] Визначити набір read-model queries для віджетів dashboard
- [ ] Реалізувати route-level composition у `app/(app)/dashboard`
- [ ] Реалізувати summary cards і списки останніх доданих монет
- [ ] Реалізувати агрегати за категоріями та дорогоцінністю
- [ ] Реалізувати графіки вкладень у часі, за роками придбання та за `mint_year`
- [ ] Підготувати UX для порожніх станів і великих списків
- [ ] Додати або оновити інтеграційні тести для dashboard queries і агрегатів

## Acceptance criteria
- [ ] Загальна кількість монет
- [ ] Загальна сума вкладень у вихідних валютах / грн та в еквіваленті USD за зафіксованим курсом на дату придбання
- [ ] Розбивка за категоріями
- [ ] Розбивка дорогоцінні / звичайні
- [ ] Список останніх доданих монет
- [ ] Графік накопичених вкладень у часі за `acquired_at`
- [ ] Витрати за роками придбання
- [ ] Гістограма монет за `mint_year`

## Нотатки з реалізації


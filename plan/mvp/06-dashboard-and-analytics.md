# 06. Dashboard і статистика

## Статус
завершено

## Зв'язок з roadmap
Походить з розділу `4. Dashboard / статистика` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): `src/app/(app)/dashboard` є compositional route, а coin-specific queries/read-models та віджети живуть у `src/features/coins/dashboard`.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)
- [03-app-shell-and-navigation.md](03-app-shell-and-navigation.md)
- [04-coins-browse-search-and-details.md](04-coins-browse-search-and-details.md)
- [05-coins-crud-categories-and-photos.md](05-coins-crud-categories-and-photos.md)

## Підзадачі
- [x] Визначити набір read-model queries для віджетів dashboard
- [x] Реалізувати route-level composition у `src/app/(app)/dashboard`
- [x] Реалізувати summary cards і списки останніх доданих монет
- [x] Реалізувати агрегати за категоріями та дорогоцінністю
- [x] Реалізувати графіки вкладень у часі, за роками придбання та за `mint_year`
- [x] Підготувати UX для порожніх станів і великих списків
- [x] Додати або оновити інтеграційні тести для dashboard queries і агрегатів

## Acceptance criteria
- [x] Загальна кількість монет
- [x] Загальна сума вкладень у вихідних валютах / грн та в еквіваленті USD за зафіксованим курсом на дату придбання
- [x] Розбивка за категоріями
- [x] Розбивка дорогоцінні / звичайні
- [x] Список останніх доданих монет
- [x] Графік накопичених вкладень у часі за `acquired_at`
- [x] Витрати за роками придбання
- [x] Гістограма монет за `mint_year`

## Нотатки з реалізації
- 2026-08-14: Додано coin-specific read-model для dashboard у `src/features/coins/dashboard/server/queries.ts` з агрегуванням загальної кількості монет, вкладень за валютами, USD-еквіваленту, розбивки за категоріями та дорогоцінністю, списку останніх монет і часових серій.
- 2026-08-14: `src/app/(app)/dashboard/page.tsx` перетворено на compositional route, який підтягує snapshot з `src/features/coins/dashboard` і не створює окремого dashboard-домену.
- 2026-08-14: Додано UI-віджети в `src/features/coins/dashboard/ui/coins-dashboard.tsx`: summary cards, breakdown bars, список останніх доданих монет, графік накопичених вкладень, витрати за роками придбання та гістограму за `mint_year`.
- 2026-08-14: Для порожньої колекції додано окремий empty state з CTA на створення першої монети та швидким переходом у розділ колекції.
- 2026-08-14: Додано інтеграційні тести для dashboard snapshot та агрегатів у `tests/integration/dashboard/queries.test.ts`; локально успішно пройшли `npm run test:integration` і `npm run build`.

# 03. App shell, layout і навігація

## Статус
завершено

## Зв'язок з roadmap
Походить з розділу `UI / Дизайн` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): route composition у `src/app/`, shared layout/UI primitives у `src/shared/ui`, доменні entrypoints у `src/features/coins` і `src/features/bonds`, а dashboard лишається route-level composition.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)

## Підзадачі
- [x] Створити захищений app shell з sidebar layout на App Router
- [x] Реалізувати розкривні доменні секції навігації
- [x] Додати заглушку `ОВДП` з неактивним станом і міткою `"скоро"`
- [x] Окремо винести top-level маршрут dashboard
- [x] Зафіксувати палітру ролей і типографіку в shared theme/token layer
- [x] Забезпечити client-side navigation без повного перемальовування layout
- [x] Додати або оновити тести для layout guards і навігаційних станів, де це доцільно

## Acceptance criteria
- [x] Бічна навігація з розкривними доменами (Монети → Колекція/Бажанки)
- [x] Пункт ОВДП присутній, візуально приглушений, з міткою "скоро", некликабельний до реалізації
- [x] Дашборд — окремий пункт верхнього рівня
- [x] Активний розділ і підрозділ візуально виділені (акцентний фон)

## Нотатки з реалізації
- 2026-08-14: Захищений `(app)` layout перебудовано в повноцінний app shell із sidebar через `src/shared/ui/app-shell.tsx` і `src/shared/ui/sidebar-nav.tsx`.
- 2026-08-14: Додано shared theme/token layer у `src/shared/ui/theme.css`; зафіксовано ролі кольорів (`accent`, `amber`, neutral) і serif/sans типографіку для заголовків та навігації.
- 2026-08-14: Реалізовано канонічну навігаційну модель у `src/shared/ui/navigation.ts` з top-level `Дашборд`, доменом `Монети` (`Колекція`, `Бажанки`) і muted placeholder-секцією `ОВДП` з бейджем `скоро`.
- 2026-08-14: Додано route entrypoints `src/app/(app)/coins/page.tsx`, `src/app/(app)/coins/collection/page.tsx`, `src/app/(app)/coins/wishlist/page.tsx`, щоб App Router тримав shell між переходами без повного перемальовування layout.
- 2026-08-14: Додано навігаційні тести в `tests/integration/navigation/navigation-state.test.ts`; локально успішно пройшли `npm run test:integration` і `npm run build`.

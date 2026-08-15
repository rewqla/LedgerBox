# 03. App shell, layout і навігація

## Статус
не розпочато

## Зв'язок з roadmap
Походить з розділу `UI / Дизайн` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): route composition у `src/app/`, shared layout/UI primitives у `src/shared/ui`, доменні entrypoints у `src/features/coins` і `src/features/bonds`, а dashboard лишається route-level composition.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)

## Підзадачі
- [ ] Створити захищений app shell з sidebar layout на App Router
- [ ] Реалізувати розкривні доменні секції навігації
- [ ] Додати заглушку `ОВДП` з неактивним станом і міткою `"скоро"`
- [ ] Окремо винести top-level маршрут dashboard
- [ ] Зафіксувати палітру ролей і типографіку в shared theme/token layer
- [ ] Забезпечити client-side navigation без повного перемальовування layout
- [ ] Додати або оновити тести для layout guards і навігаційних станів, де це доцільно

## Acceptance criteria
- [ ] Бічна навігація з розкривними доменами (Монети → Колекція/Бажанки)
- [ ] Пункт ОВДП присутній, візуально приглушений, з міткою "скоро", некликабельний до реалізації
- [ ] Дашборд — окремий пункт верхнього рівня
- [ ] Активний розділ і підрозділ візуально виділені (акцентний фон)

## Нотатки з реалізації

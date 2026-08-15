# 02. Авторизація і контроль доступу

## Статус
не розпочато

## Зв'язок з roadmap
Походить з розділу `1. Авторизація` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): код живе переважно у `src/features/auth`, `src/shared/auth`, `src/app/(auth)` і `src/app/(app)`.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)

## Підзадачі
- [ ] Налаштувати Supabase Auth для входу email+пароль
- [ ] Реалізувати login route segment і захищений app layout
- [ ] Заблокувати self-signup у конфігурації auth
- [ ] Додати membership guard на основі `public.profiles`
- [ ] Визначити й задокументувати процедуру створення першого користувача: власник проєкту вручну створює Auth-user і запис у `public.profiles`
- [ ] Зафіксувати, що пароль не зберігається й не хешується в коді застосунку або міграціях; це робить Supabase Auth
- [ ] Забезпечити збереження сесії між візитами
- [ ] Покрити edge cases: auth є, але `profiles` запису немає
- [ ] Додати або оновити інтеграційні тести для auth flow і membership access

## Acceptance criteria
- [ ] Вхід через email+пароль (Supabase Auth)
- [ ] Без входу — недоступні жодні дані (редірект на сторінку логіну)
- [ ] Сесія зберігається (не треба логінитись щоразу)
- [ ] Реєстрація нових користувачів вимкнена; доступ додається вручну
- [ ] Перший користувач створюється окремою процедурою bootstrap, а не через дефолтні креденшіали в коді чи міграціях
- [ ] Наявність auth-акаунта сама по собі не дає доступу — потрібен запис у `public.profiles`
- [ ] Користувач не може самостійно додати себе або інших у `public.profiles`
- [ ] RLS-політики перевіряють наявність `auth.uid()` у `public.profiles`
- [ ] Усі користувачі з `profiles` мають однаковий доступ до спільної колекції
- [ ] У доменних таблицях немає `owner_id`

## Нотатки з реалізації

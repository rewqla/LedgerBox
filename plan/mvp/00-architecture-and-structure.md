# 00. Архітектура і файлова структура

## Статус
завершено

## Зв'язок з roadmap
Базується на розділах `Технічний стек`, `Архітектура бази даних (модульний моноліт)`, `UI / Дизайн` і Future Roadmap у [../../docs/roadmap.md](../../docs/roadmap.md). Цей документ фіксує кодову структуру, яка напряму віддзеркалює домени БД: `coins`, `bonds`, спільне через `public.profiles`.

## Обраний архітектурний підхід
Обираємо `src/ + App Router + colocated vertical slices + explicit shared layer`:

- `src/` є коренем для всього application code
- `src/app/` відповідає лише за маршрути, layouts, server entrypoints і route-level composition
- `src/features/` містить доменні vertical slices, прив'язані до бізнес-доменів: `auth`, `coins`, пізніше `bonds`
- `dashboard` не є окремим доменом і не живе як самостійна фіча верхнього рівня; це compositional surface у `src/app/`, який збирає read-models і віджети з доменних фіч
- `src/shared/` містить тільки справді спільні речі: auth-guard, UI primitives, клієнти Supabase, крос-фічеві утиліти

Чому саме так:
- Це краще лягає на Next.js App Router, ніж класичні глобальні `components/`, `hooks/`, `utils/`, бо route composition лишається colocated у `src/app/`, а доменна логіка не розмазується по всьому репозиторію
- Це зберігає screaming architecture: структура коду кричить про домени (`coins`, `wishlist`, `bonds`), а не про технічні шари
- Це не штучно вигадує окремий домен `dashboard`, якщо його роль лише композиційна й аналітична поверхня над доменами
- Це масштабується під roadmap: `bonds` додається окремим slice без змішування з `coins`, а dashboard просто отримує ще одне джерело віджетів
- `src/` тримає application code окремо від `docs/`, `plan/`, `skills/`, `supabase/` і конфігурації репозиторію

Альтернативи, які не обираємо:
- Глобальні technical folders (`components/`, `hooks/`, `utils/`) як основну організацію: надто легко отримати змішування доменів
- Повністю route-only colocation без `features/`: для App Router це зручно на малому проєкті, але гірше тримає межі між доменами й складніше переносить доменний код між кількома маршрутами
- `features/dashboard` як окрему верхньорівневу фічу: це розмиває межі, бо статистика походить з доменів, а не існує сама по собі

## Дерево директорій верхнього рівня

```text
src/
  app/
    (auth)/
    (app)/
      dashboard/
    api/
  features/
    auth/
    coins/
      collection/
      categories/
      photos/
      import-export/
      wishlist/
      dashboard/
    bonds/
      dashboard/      # майбутні bond-віджети для загального dashboard
  shared/
    auth/
    db/
    supabase/
    ui/
    validation/
    lib/

supabase/
  migrations/
  config files...

tests/
  integration/
  fixtures/
  helpers/

plan/
  mvp/
skills/
docs/
```

## Призначення директорій
- `src/app/`: App Router entrypoints, layouts, route segments, server/action boundaries, page-level composition
- `src/features/auth`: login flow, auth guards, auth-specific forms/actions that are not shared across all domains
- `src/features/coins`: уся логіка домену монет, включно з `collection`, `categories`, `photos`, `import-export`, `wishlist` і coin-specific dashboard read-models/widgets
- `src/features/bonds`: майбутній окремий домен, що віддзеркалює схему `bonds`
- `src/app/(app)/dashboard`: маршрут і композиція загального dashboard
- `src/shared/auth`: універсальні auth helpers і membership checks через `public.profiles`
- `src/shared/db` і `src/shared/supabase`: клієнти, adapters, транзакційні/інфраструктурні обгортки
- `src/shared/ui`: базовий UI-kit і layout primitives без доменної логіки
- `src/shared/validation`: тільки крос-доменні схеми; доменні Zod-схеми живуть у відповідній фічі
- `src/shared/lib`: дрібні утиліти, які не належать конкретній фічі
- `supabase/`: міграції й конфігурація локального/remote Supabase як код
- `tests/integration`: інтеграційні тести фіч і RLS
- `tests/fixtures`, `tests/helpers`: тестові фікстури, auth/setup helpers, storage/database assertions
- `plan/mvp`: послідовні кроки MVP
- `plan/{feature}`: окремі майбутні гілки планування після MVP, якщо з'являться нові напрями роботи

## Межі фіч і що вважається "витоком"
Витік між фічами це:

- Прямий імпорт UI-компонента, query, action, schema або internal helper з однієї фічі в іншу
- Читання або запис у таблиці іншого домену напряму, якщо це не узгоджений shared infrastructural concern
- Розміщення доменної логіки в `src/shared/` лише "щоб було зручно переюзати"
- Винесення доменної пошукової або аналітичної логіки у загальний reusable helper без реальної крос-доменної потреби

Як уникати витоків:

- Кожна фіча експортує лише публічний API через власні index/barrel entrypoints або route handlers
- Крос-фічева взаємодія дозволена лише через:
  - `src/shared/*` для інфраструктури й базових примітивів
  - явні read-model adapters або application services, якщо з'явиться реальна потреба
- `wishlist` у коді живе всередині `src/features/coins/wishlist`, бо в БД це частина схеми `coins`
- `dashboard` маршрут може читати агреговані дані з доменів, але не створює окремий "dashboard-домен"

## Відповідність кодової структури схемам БД
- `public.profiles` ↔ `src/shared/auth` і `src/features/auth`
- `coins.*` ↔ `src/features/coins/*`
- `coins.wishlist_items` ↔ `src/features/coins/wishlist`
- `coins`-dashboard widgets/read-models ↔ `src/features/coins/dashboard`
- `bonds.*` ↔ `src/features/bonds/*`
- `bonds`-dashboard widgets/read-models ↔ `src/features/bonds/dashboard`

## Обов'язкове правило для наступних кроків
Кожен наступний плановий крок, який змінює код, повинен:

- явно посилатись на цей документ
- вказувати, які `src/features/*` папки зачіпаються
- окремо позначати, чи з'являється новий код у `src/shared/*`
- містити підзадачу на оновлення або додавання тестів саме для цього кроку

## Acceptance criteria
- [x] Файлова структура коду віддзеркалює домени БД (`coins`, `bonds`, `public.profiles`)
- [x] Основна організація коду побудована навколо vertical slices, а не глобальних technical folders
- [x] Dashboard не оформлений як окремий бізнес-домен; це compositional route, який збирає доменні read-models
- [x] Shared-шар містить лише auth, UI-kit, Supabase/db infrastructure та інші справді спільні примітиви
- [x] Прямі імпорти між фічами вважаються порушенням меж і не допускаються поза явним shared-шаром

## Нотатки з реалізації
- 2026-08-14: Створено базовий каркас директорій `src/app/`, `src/features/`, `src/shared/`, `supabase/`, `tests/` відповідно до затвердженої архітектури vertical slices.
- 2026-08-14: Додано мінімальні `README.md` і `.gitkeep`, щоб структура була зафіксована в репозиторії ще до появи прикладного коду.
- 2026-08-14: README оновлено під фактичний стан проєкту: наразі реалізовано архітектурний каркас, а не прикладні фічі.
- 2026-08-14: Каркас перенесено під `src/`, а рішення зафіксовано в ADR `docs/adr/0001-use-src-application-root.md`.

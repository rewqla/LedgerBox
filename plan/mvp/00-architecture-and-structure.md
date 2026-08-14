# 00. Архітектура і файлова структура

## Статус
не розпочато

## Зв'язок з roadmap
Базується на розділах `Технічний стек`, `Архітектура бази даних (модульний моноліт)`, `UI / Дизайн` і Future Roadmap у [../../docs/roadmap.md](../../docs/roadmap.md). Цей документ фіксує кодову структуру, яка напряму віддзеркалює домени БД: `coins`, `bonds`, спільне через `public.profiles`.

## Обраний архітектурний підхід
Обираємо `App Router + colocated vertical slices + explicit shared layer`:

- `app/` відповідає лише за маршрути, layouts, server entrypoints і route-level composition
- `features/` містить доменні vertical slices, прив'язані до бізнес-доменів: `auth`, `coins`, пізніше `bonds`
- `dashboard` не є окремим доменом і не живе як самостійна фіча верхнього рівня; це compositional surface у `app/`, який збирає read-models і віджети з доменних фіч
- `shared/` містить тільки справді спільні речі: auth-guard, UI primitives, клієнти Supabase, крос-фічеві утиліти

Чому саме так:
- Це краще лягає на Next.js App Router, ніж класичні глобальні `components/`, `hooks/`, `utils/`, бо route composition лишається colocated у `app/`, а доменна логіка не розмазується по всьому репозиторію
- Це зберігає screaming architecture: структура коду кричить про домени (`coins`, `wishlist`, `bonds`), а не про технічні шари
- Це не штучно вигадує окремий домен `dashboard`, якщо його роль лише композиційна й аналітична поверхня над доменами
- Це масштабується під roadmap: `bonds` додається окремим slice без змішування з `coins`, а dashboard просто отримує ще одне джерело віджетів

Альтернативи, які не обираємо:
- Глобальні technical folders (`components/`, `hooks/`, `utils/`) як основну організацію: надто легко отримати змішування доменів
- Повністю route-only colocation без `features/`: для App Router це зручно на малому проєкті, але гірше тримає межі між доменами й складніше переносить доменний код між кількома маршрутами
- `features/dashboard` як окрему верхньорівневу фічу: це розмиває межі, бо статистика походить з доменів, а не існує сама по собі

## Дерево директорій верхнього рівня

```text
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
- `app/`: App Router entrypoints, layouts, route segments, server/action boundaries, page-level composition
- `features/auth`: login flow, auth guards, auth-specific forms/actions that are not shared across all domains
- `features/coins`: уся логіка домену монет, включно з `collection`, `categories`, `photos`, `import-export`, `wishlist` і coin-specific dashboard read-models/widgets
- `features/bonds`: майбутній окремий домен, що віддзеркалює схему `bonds`
- `app/(app)/dashboard`: маршрут і композиція загального dashboard
- `shared/auth`: універсальні auth helpers і membership checks через `public.profiles`
- `shared/db` і `shared/supabase`: клієнти, adapters, транзакційні/інфраструктурні обгортки
- `shared/ui`: базовий UI-kit і layout primitives без доменної логіки
- `shared/validation`: тільки крос-доменні схеми; доменні Zod-схеми живуть у відповідній фічі
- `shared/lib`: дрібні утиліти, які не належать конкретній фічі
- `supabase/`: міграції й конфігурація локального/remote Supabase як код
- `tests/integration`: інтеграційні тести фіч і RLS
- `tests/fixtures`, `tests/helpers`: тестові фікстури, auth/setup helpers, storage/database assertions
- `plan/mvp`: послідовні кроки MVP
- `plan/{feature}`: окремі майбутні гілки планування після MVP, якщо з'являться нові напрями роботи

## Межі фіч і що вважається "витоком"
Витік між фічами це:

- Прямий імпорт UI-компонента, query, action, schema або internal helper з однієї фічі в іншу
- Читання або запис у таблиці іншого домену напряму, якщо це не узгоджений shared infrastructural concern
- Розміщення доменної логіки в `shared/` лише "щоб було зручно переюзати"
- Винесення доменної пошукової або аналітичної логіки у загальний reusable helper без реальної крос-доменної потреби

Як уникати витоків:

- Кожна фіча експортує лише публічний API через власні index/barrel entrypoints або route handlers
- Крос-фічева взаємодія дозволена лише через:
  - `shared/*` для інфраструктури й базових примітивів
  - явні read-model adapters або application services, якщо з'явиться реальна потреба
- `wishlist` у коді живе всередині `features/coins/wishlist`, бо в БД це частина схеми `coins`
- `dashboard` маршрут може читати агреговані дані з доменів, але не створює окремий "dashboard-домен"

## Відповідність кодової структури схемам БД
- `public.profiles` ↔ `shared/auth` і `features/auth`
- `coins.*` ↔ `features/coins/*`
- `coins.wishlist_items` ↔ `features/coins/wishlist`
- `coins`-dashboard widgets/read-models ↔ `features/coins/dashboard`
- `bonds.*` ↔ `features/bonds/*`
- `bonds`-dashboard widgets/read-models ↔ `features/bonds/dashboard`

## Обов'язкове правило для наступних кроків
Кожен наступний плановий крок, який змінює код, повинен:

- явно посилатись на цей документ
- вказувати, які `features/*` папки зачіпаються
- окремо позначати, чи з'являється новий код у `shared/*`
- містити підзадачу на оновлення або додавання тестів саме для цього кроку

## Acceptance criteria
- [ ] Файлова структура коду віддзеркалює домени БД (`coins`, `bonds`, `public.profiles`)
- [ ] Основна організація коду побудована навколо vertical slices, а не глобальних technical folders
- [ ] Dashboard не оформлений як окремий бізнес-домен; це compositional route, який збирає доменні read-models
- [ ] Shared-шар містить лише auth, UI-kit, Supabase/db infrastructure та інші справді спільні примітиви
- [ ] Прямі імпорти між фічами вважаються порушенням меж і не допускаються поза явним shared-шаром

## Нотатки з реалізації


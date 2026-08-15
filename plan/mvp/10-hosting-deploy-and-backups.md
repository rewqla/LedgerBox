# 10. Хостинг, деплой і резервні копії

## Статус
не розпочато

## Зв'язок з roadmap
Походить з розділу `Хостинг та інфраструктура` у [../../docs/roadmap.md](../../docs/roadmap.md). Крок має слідувати [00-architecture-and-structure.md](00-architecture-and-structure.md): це інфраструктурний крок, який не змінює межі доменних фіч, але має поважати міграційний і модульний підхід, зафіксований у `supabase/` та `src/shared/*`.

## Залежності
- [00-architecture-and-structure.md](00-architecture-and-structure.md)
- [01-db-architecture-and-migrations.md](01-db-architecture-and-migrations.md)
- [02-auth-and-access-control.md](02-auth-and-access-control.md)
- [09-testing-and-ci.md](09-testing-and-ci.md)

## Підзадачі
- [ ] Налаштувати production deploy path: GitHub -> Vercel -> production
- [ ] Підключити секрети через Vercel / GitHub Secrets
- [ ] Зафіксувати, що креденшіали передаються тільки через `.env.local` локально та env variables/secret storage на хостингу
- [ ] Додати CI/CD крок автоматичного застосування міграцій
- [ ] Реалізувати GitHub Actions для daily DB backup
- [ ] Реалізувати GitHub Actions для weekly full backup DB + `coin-photos`
- [ ] Зафіксувати retention policy і автоматичне видалення застарілих backup-ів
- [ ] Описати й один раз перевірити процедуру restore на тестовому середовищі

## Acceptance criteria
- [ ] Сайт доступний за постійним HTTPS-посиланням
- [ ] Деплой автоматичний з git, без ручних кроків
- [ ] Дані не втрачаються при редеплої (БД та Storage окремі від коду)
- [ ] Креденшіали не зберігаються в репозиторії й не передаються в коді; локально вони живуть у `.env.local`, на хостингу — у secret storage
- [ ] Міграції застосовуються автоматично через CI/CD
- [ ] DB backup запускається автоматично щодня
- [ ] Повний backup DB + `coin-photos` запускається автоматично щотижня
- [ ] Backup workflow працює без ручних дій
- [ ] Секрети backup workflow зберігаються тільки в GitHub Secrets / відповідному secret storage
- [ ] Є retention policy, яка автоматично видаляє застарілі backup-и
- [ ] Процедура restore описана і хоча б один раз перевірена на тестовому середовищі

## Нотатки з реалізації

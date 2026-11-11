# Hitmigo — сигнали за обяви: схема и безопасно внедряване

Статус: **проект за внедряване; не е изпълняван в Supabase**.

## Потвърдено
- Сайтът използва `public.ads` и клиент Supabase.
- Проверката за таблици с имена `%report%` не е открила такава таблица. Това не доказва липса на таблица с друго име.
- `is_hitmigo_admin()` се използва от административния панел; реалните права на функцията и типа на `ads.id` трябва да бъдат проверени.

## Проверки преди миграция (само четене)
```sql
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'ads'
  AND column_name IN ('id', 'user_id', 'is_hidden');

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_hitmigo_admin', 'admin_set_ad_hidden');
```

## Предложена схема
`public.ad_reports`:
- `id` UUID primary key with `gen_random_uuid()`
- `ad_id` със **същия тип** като `public.ads.id`, FK към `ads(id)`, ON DELETE CASCADE
- `reporter_id` UUID NOT NULL, FK към `auth.users(id)`
- `reason` TEXT NOT NULL, ограничена дължина (например 10–500 знака)
- `status` TEXT NOT NULL DEFAULT 'pending', CHECK IN ('pending','reviewed','dismissed')
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `reviewed_at` TIMESTAMPTZ NULL, `reviewed_by` UUID NULL

Уникален индекс по (`ad_id`, `reporter_id`) предотвратява повторен сигнал от същия профил за същата обява. Индекси по (`status`, `created_at DESC`) и `ad_id` за административния списък.

## Права и логика
1. Включен RLS. Само удостоверен потребител може да подаде сигнал със `reporter_id = auth.uid()`; без клиентски UPDATE/DELETE на сигнали.
2. Само администратор може да чете всички сигнали и да променя `status`, чрез проверена сървърна функция. Не се излагат лични данни на подателя в публичните заявки.
3. Публичната обява **не се скрива автоматично** при сигнал. Администраторът решава отделно дали да я скрие чрез съществуващата защитена функция.
4. Административният панел сортира по необработени сигнали и дата, маркира ги в червено, показва брой сигнали и позволява преглед и обработка.
5. Проверки: обикновен потребител не може да чете чужди сигнали, да подправя reporter_id или да променя статус; администраторът може да обработва; дублирането е блокирано.

## Условие за изпълнение
**Не изпълнявайте CREATE TABLE/политики преди проверка на типовете и съществуващите RLS правила.** След резултата от SQL проверките може да се подготви точна миграция и да се свърже интерфейсът в отделния GitHub клон.

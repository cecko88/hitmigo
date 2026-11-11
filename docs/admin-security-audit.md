# Hitmigo — техническа проверка преди активиране на модериране (11.11.2026)

Статус: преглед на клиентския код, НЕ проверка на реалната Supabase схема или RLS.

## Потвърдено от кода
- hitmigo-ads.js публикува директно в public.ads и показва успех при успешен INSERT.
- Публичният списък чете до 200 реда от ads без филтър по статус.
- „Моите обяви“ зарежда записи по user_id; клиентът изпраща update/delete с user_id филтър.
- admin-panel.html изисква RPC is_hitmigo_admin и не показва админ панела, ако проверката се провали. Той е само за четене.
- docs/admin-auth-draft.sql създава таблица с администратори и RPC, но НЕ е изпълняван в Supabase.

## Преди да добавяме „Скрий“ и „Одобри“
1. Преглед на реалните колони, ограничения, RLS политики и Storage политики на public.ads и ad-images.
2. Проверка дали вече съществува поле за статус/видимост. Не предполагаме, че има.
3. Ако липсва, планираме съвместима миграция и обновяваме публичното четене да показва само видими обяви.
4. Правата за модерация се налагат в базата (RLS или проверени SECURITY DEFINER RPC), не само чрез скрити бутони.
5. Проверка с обикновен и администраторски профил, включително опит за неразрешена промяна.
6. Едва след това активираме действията в панела и обмисляме сливане към живия клон.

## Заявка за инспекция — изпълнява се ръчно в Supabase SQL Editor; само SELECT
```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'ads'
order by ordinal_position;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('ads', 'hitmigo_admins')
order by tablename, policyname;

select relname, relrowsecurity, relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('ads', 'hitmigo_admins');
```

Не споделяй пароли, токени или service_role ключове. Резултатите от тези SELECT заявки не би трябвало да съдържат лични данни, но ги прегледай преди споделяне.

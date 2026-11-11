# Hitmigo VIP — read-only Supabase audit before implementation

Status: preparation only. Do not activate VIP, change production tables, or grant client-side write permissions from this document.

## Confirmed product rules
- One 30-day trial window starting on the user's original registration date.
- Three **lifetime** trial activations per user, not three concurrent VIP ads.
- Deleting an ad must never refund an activation.
- No automatic billing. Expired trial VIP returns to ordinary display.

## Verified so far (from previous manual Supabase checks)
- `public.vip_activations` has columns `id`, `user_id`, `ad_id`, `activated_at`, `expires_at`.
- RLS was reported enabled with a read-own policy.
- Direct INSERT for anon/authenticated and UPDATE for authenticated were reported denied.
- These observations do **not** prove that the registration timestamp, lifetime counter, or atomic activation RPC exists.

## Next SQL audit — read-only
Run in Supabase SQL Editor and inspect the results; do not share user rows, credentials, or tokens.

```sql
-- Column types and defaults for VIP-related tables and user profiles
SELECT table_name, column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (table_name IN ('ads', 'vip_activations', 'profiles', 'user_profiles')
       OR column_name ILIKE '%vip%'
       OR column_name ILIKE '%trial%')
ORDER BY table_name, ordinal_position;

-- Foreign keys, unique constraints, and CHECK constraints
SELECT c.conrelid::regclass::text AS table_name,
       c.conname AS constraint_name,
       pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE n.nspname = 'public'
  AND c.conrelid IN ('public.ads'::regclass, 'public.vip_activations'::regclass)
ORDER BY table_name, constraint_name;

-- Existing VIP and registration-related server functions
SELECT routine_name, security_type, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_name ILIKE '%vip%'
       OR routine_name ILIKE '%trial%'
       OR routine_name ILIKE '%register%')
ORDER BY routine_name;

-- RLS policies on VIP and ads
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('vip_activations', 'ads')
ORDER BY tablename, policyname;

-- Registration-related triggers (names only, no private data)
SELECT event_object_table AS table_name, trigger_name, action_timing,
       event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
  AND (event_object_table IN ('users', 'profiles', 'user_profiles')
       OR trigger_name ILIKE '%vip%')
ORDER BY table_name, trigger_name;
```

## Design gates
1. Determine authoritative original signup time; never reset it on login.
2. Ensure activation ledger retains lifetime trial usage even if ads are deleted. A foreign key with ON DELETE CASCADE to ads is **not suitable** for a permanent ledger.
3. Activation must run in one trusted server transaction with per-user serialization/locking, ownership check, 30-day window check, lifetime count < 3, and durable ledger insert.
4. Prevent ordinary users from updating any VIP fields directly. Do not embed service-role secrets in frontend code.
5. Define expiry semantics in UTC and compute VIP display from server-backed expiration.
6. Test the fourth activation, deleted ads, expiry, forged requests, and concurrent requests before enabling UI.

## Release gate
No activation buttons or promotional claim that VIP is active until schema, server function, RLS, and browser tests are verified. Keep production site unchanged.

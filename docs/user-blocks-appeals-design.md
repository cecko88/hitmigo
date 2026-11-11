# Hitmigo: permanent user blocks and appeals — DRAFT, NOT DEPLOYED

## Approved product rules
- An administrator may permanently block a user; only an administrator can lift the block. No automatic expiry.
- Blocked users can sign in and read a clear notice: “Профилът ви е блокиран поради нарушение на правилата на Hitmigo.” Include a way to appeal.
- Blocked users cannot create or edit ads. Existing ads become invisible to public visitors immediately, without deletion.
- Unblocking restores the ability to post, but **never automatically republishes old ads**. Admin must approve restoration separately.
- An appeal is available from the blocked account; at most one pending appeal per user. Admin can approve (unblock) or reject. Internal notes and moderator identity are not exposed publicly.
- Store reason, actor and timestamps in an immutable audit trail. Prevent administrators from accidentally blocking themselves.

## Security-first implementation architecture
1. Add a private user moderation state table keyed by auth user ID, with blocked_at, blocked_by, reason_code and a flag indicating blocked status. Avoid making raw user email or admin notes public.
2. Store each block/unblock in an append-only audit table. Prefer a privileged server-side transaction, never a client-side sequence.
3. Add an appeals table with a **partial unique index** on (user_id) WHERE status='pending'; enforce character limits and rate limits. Users can insert/read only their own appeals; admins can review and resolve.
4. Server-side admin RPCs must verify the authenticated caller's admin role, reject self-blocking, and apply updates transactionally. Do not accept a client-provided admin ID.
5. **Critical:** enforce blocking through database RLS / triggers for ads INSERT and UPDATE. Hiding a button in JavaScript is not a security boundary. Ensure every public ads SELECT excludes blocked authors; alternatively set all affected ads to hidden in the same transaction and preserve original moderation state.
6. Prefer an explicit `hidden_due_to_user_block` marker separate from manual `is_hidden`. On unblock, keep ads hidden and require individual admin restoration; never overwrite independently hidden ads.
7. Provide a limited public status RPC for the signed-in blocked user that returns only their own block state and public-facing reason. Admin UI requires an admin-only RPC; do not expose all user accounts to ordinary clients.
8. Consider moderation of new appeals, email notification only after safe delivery and anti-spam checks, and clear appeal response states.

## Required verification before merge
- Inspect actual Supabase tables, RLS, admin RPCs, and triggers. This repository alone does **not** verify production database schema.
- Verify no blocked account can INSERT/UPDATE ads by direct Supabase REST requests, even if it bypasses the website.
- Verify blocked ads are absent from all public listings, searches, and direct ad reads.
- Verify two-account tests: non-admin cannot block/unblock, see other appeals, or access private reasons.
- Verify admin self-block protection, repeated clicks, unblocking, and approval without accidental republication.
- Verify one pending appeal constraint under concurrent requests and safe rate limiting.
- Review recovery plan and database migration rollback, then run browser/mobile smoke tests.

**Release gate:** Do not execute database migrations, connect this module to production, or merge into main until all checks pass. This file is a design specification, not an implemented blocking system.

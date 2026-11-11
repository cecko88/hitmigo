# Hitmigo Supabase security audit — prepared, not executed

**Scope:** Read-only inspection first. Do not change production RLS, storage, auth, functions or secrets before evidence and a rollback plan. Do not paste credentials or service-role keys into chat or repository.

## 1. Database: public.ads
- Confirm RLS is enabled and policies for SELECT, INSERT, UPDATE and DELETE exist.
- Anonymous users must not write ads. Authenticated users may INSERT only with `user_id = auth.uid()` and may UPDATE/DELETE only their own ads; check both USING and WITH CHECK.
- Verify users cannot reassign `user_id`, set admin-only fields such as `is_hidden`, or bypass moderation by changing row values.
- Confirm hidden/blocked-user ads are not publicly retrievable via direct API or search.
- Test with two distinct test accounts, including direct Supabase API requests, not only website buttons.

## 2. Storage: ad-images
- Check bucket public/private setting, allowed MIME types, max file size <= 10 MiB, and file type validation.
- Check storage.objects RLS for INSERT, SELECT and DELETE; authenticated user must only write/delete in their own UID prefix.
- Verify arbitrary path traversal, foreign-user deletion and oversized uploads are denied server-side.
- Confirm orphan-image cleanup is not deployed until permissions and failure handling are tested.

## 3. Auth, abuse prevention
- Check email confirmation, password settings, CAPTCHA or bot protection, and rate limits for signup, sign-in, password reset and ad creation.
- Check auth redirect allowlist and domain configuration; avoid wildcard redirects.
- Review whether public error messages disclose private user data.

## 4. Admin functions and sensitive data
- Check `is_hitmigo_admin` and `admin_set_ad_hidden` function definitions, grants and SECURITY DEFINER search_path.
- Verify admin authorization inside each RPC; ordinary users must not obtain admin data or invoke moderation.
- Confirm no service_role key, DB password, or other secret appears in public GitHub Pages HTML/JS.
- Confirm planned user blocks and appeals use server-side enforcement and private audit data, not only frontend buttons.

## 5. Operational recovery
- Verify backup availability and recovery process; document restore point before migrations.
- Review Supabase logs for repeated denied requests, unexpected auth events, and storage errors.
- Review GitHub repository access, branch protection, dependency alerts and Pages deployment status.

## Evidence / release gate
For each check record: verified setting, evidence (screenshot or non-secret policy definition), pass/fail, remediation, and retest. Do not record tokens, passwords, API secrets or personal user data.
No finding here claims production settings are secure or insecure: actual Supabase console has not been inspected.
Do not merge moderation, VIP, or image-cleanup code into main before relevant checks and browser tests.

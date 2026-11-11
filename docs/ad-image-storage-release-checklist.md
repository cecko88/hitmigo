# Ad image cleanup: release checklist (not yet deployed)

## Implemented in test branch
After successful deletion of an owned ad, the client attempts to remove its associated photo only if the public URL matches the `ad-images` bucket on the configured Supabase origin and its path starts with the authenticated user's ID. Cleanup failure does not change the already-successful deletion result; the user receives a warning. This does **not** remove orphaned images from past deletions or replace server-side access controls.

## Required Supabase checks before release
- Confirm the `ad-images` bucket exists and the allowed MIME types and file-size limit (10 MiB) are enforced **server-side**. Browser MIME checks are not sufficient to verify file content.
- Confirm Storage RLS permits authenticated users to upload only under `auth.uid()::text || '/'` and delete only their own objects; prohibit cross-user deletes. Confirm policy behavior with two distinct test accounts.
- Confirm `ads` RLS enforces owner-only UPDATE and DELETE regardless of client-provided user_id.
- Test deletion with photo, without photo, with a legacy/external photo URL, and with Storage DELETE denied. Ad deletion should succeed even when photo cleanup fails.
- Test image uploads with allowed JPG/PNG/WebP/GIF/HEIC, unsupported formats, empty files, and files over 10 MiB. Verify actual server responses.
- Confirm how old orphan images will be handled separately; do not run broad automatic cleanup without an inventory and backup plan.

Do not merge or deploy before runtime and Supabase policy tests. No Supabase settings have been changed by this commit.

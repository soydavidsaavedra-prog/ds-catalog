/**
 * Single source of truth for the parking-demo-APK bucket name — referenced
 * from app/superadmin/api/apk/upload-url/route.ts (signs the upload URL),
 * app/superadmin/actions.ts (derives the public URL after upload), and
 * supabase/schema.sql (bucket + policy). Same naming rationale as
 * lib/media/storage-bucket.ts's PRODUCT_IMAGES_BUCKET.
 */
export const DS_STUDIO_APKS_BUCKET = "ds-studio-apks";

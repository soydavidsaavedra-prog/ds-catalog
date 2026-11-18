/**
 * Shared between NSParkingApkUploadForm (client, rejects an oversized file
 * before even requesting a signed upload URL) and
 * app/superadmin/api/apk/upload-url/route.ts (server, re-checks the same
 * number — never trust the client-only gate). Unlike product images/videos,
 * this file never goes through a Vercel serverless function body at all
 * (the browser PUTs it straight to Supabase Storage via a signed URL), so
 * this cap isn't about Vercel's ~4.5MB request-body ceiling — it's just a
 * sane upper bound for a demo APK, comfortably under typical Supabase
 * project-level upload limits.
 */
export const MAX_APK_UPLOAD_BYTES = 150 * 1024 * 1024;

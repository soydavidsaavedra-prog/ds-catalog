/**
 * Shared between the upload route (server) and any client component that
 * needs to reject an oversized file before even attempting the request —
 * see NSHeroSlideUploadForm, which pre-checks video size client-side so a
 * too-large file never reaches fetch() at all. Keeping one definition
 * avoids the client and server silently drifting to different numbers.
 */
export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;

/**
 * Hero background videos are meant to be short, muted loops, not real
 * clips — this cap keeps that honest and keeps a single upload from
 * eating a big chunk of a tenant's plan storage (the upload route's own
 * maxStorageMb check still applies on top of this). It's also a hard
 * ceiling imposed from outside this codebase: Vercel rejects request
 * bodies over ~4.5MB at the platform level, before the upload route's own
 * code ever runs, returning an HTML error page instead of JSON. Checking
 * this client-side (not just server-side) is what actually prevents that
 * — once a request is that large, the platform has already rejected it by
 * the time our own size check would run.
 */
export const MAX_VIDEO_UPLOAD_BYTES = 4 * 1024 * 1024;

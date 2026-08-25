"use client";

/**
 * Vercel's Serverless Functions reject any request body over roughly 4.5MB
 * with a plain-text 413 "Request Entity Too Large" — well under this app's
 * own 8MB upload ceiling, and easily hit by an unedited phone photo. That
 * response isn't JSON, so it broke the uploader's res.json() call before
 * the file ever reached the server-side compression in
 * app/[tenant]/admin/api/upload/route.ts. This shrinks oversized images in
 * the browser first so the upload always fits under the platform limit;
 * the server then does the precise pass down to ~500KB.
 */
const CLIENT_COMPRESS_THRESHOLD_BYTES = 3 * 1024 * 1024;
const MAX_DIMENSION = 2400;
const QUALITY = 0.85;

/** Formats canvas can safely re-encode without silently changing them (e.g. AVIF support is inconsistent) or destroying transparency. */
const RECOMPRESSIBLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function compressImageBeforeUpload(file: File): Promise<File> {
  if (file.size <= CLIENT_COMPRESS_THRESHOLD_BYTES || !RECOMPRESSIBLE_TYPES.has(file.type)) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type, QUALITY));
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name, { type: file.type });
  } catch {
    // Decode/canvas failure of any kind — fall back to the original file
    // and let the server's own MAX_SIZE check be the backstop.
    return file;
  }
}

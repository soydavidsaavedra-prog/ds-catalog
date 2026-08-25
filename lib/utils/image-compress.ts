"use client";

/**
 * All compression happens here, in the browser, via Canvas — not on the
 * server. An earlier version used sharp server-side, but sharp ships
 * native binaries that turned out unreliable to load inside a Vercel
 * serverless function (it broke every upload through this route, not just
 * large ones, including images that never even touched the compression
 * path). Canvas has no such risk: it's plain browser API, and doing the
 * work client-side also sidesteps Vercel's ~4.5MB request body limit for
 * an unedited phone photo, since what actually gets sent is already small.
 */
const TARGET_MAX_BYTES = 500 * 1024;
const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];
const MAX_DIMENSION_STEPS = [2400, 1600, 1200, 900];

/** Formats canvas can safely re-encode without destroying transparency or silently failing (AVIF output support is inconsistent across browsers). */
const RECOMPRESSIBLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function drawScaled(bitmap: ImageBitmap, maxDimension: number): HTMLCanvasElement {
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

function encodeCanvas(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImageBeforeUpload(file: File): Promise<File> {
  if (file.size <= TARGET_MAX_BYTES || !RECOMPRESSIBLE_TYPES.has(file.type)) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    // PNG's quality parameter is ignored by canvas.toBlob (it's lossless) —
    // one encode per dimension is enough instead of repeating six times.
    const qualitySteps = file.type === "image/png" ? [undefined] : QUALITY_STEPS;
    const dimensionSteps = [Math.max(bitmap.width, bitmap.height), ...MAX_DIMENSION_STEPS];

    let smallest: Blob | null = null;
    for (const maxDimension of dimensionSteps) {
      const canvas = drawScaled(bitmap, maxDimension);
      for (const quality of qualitySteps) {
        const blob = await encodeCanvas(canvas, file.type, quality);
        if (!blob) continue;
        if (!smallest || blob.size < smallest.size) smallest = blob;
        if (blob.size <= TARGET_MAX_BYTES) return new File([blob], file.name, { type: file.type });
      }
    }

    // Nothing hit the target (e.g. a very dense opaque PNG) — use the
    // smallest attempt produced rather than the original, best-effort.
    if (smallest && smallest.size < file.size) return new File([smallest], file.name, { type: file.type });
    return file;
  } catch {
    // Decode/canvas failure of any kind — fall back to the original file
    // and let the server's own size check be the backstop.
    return file;
  }
}

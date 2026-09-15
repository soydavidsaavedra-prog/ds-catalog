"use client";

/**
 * Runs entirely in the browser via WASM (@imgly/background-removal) — no
 * server involvement, no native binaries. This project already hit real
 * trouble with a native-binary image tool (sharp) breaking every upload
 * inside a Vercel serverless function (see the comment in
 * app/[tenant]/admin/api/upload/route.ts and lib/utils/image-compress.ts,
 * which is why compression also moved client-side) — a server-side ML
 * background-removal provider (rembg/ONNX on the server) would risk the
 * exact same failure mode. The WASM + model files are fetched lazily from
 * IMG.LY's CDN on first use (only when an admin actually clicks "Quitar
 * fondo"), so nothing about this loads on page load, and the public
 * storefront never imports this module at all.
 *
 * Flat functions, not a class/interface hierarchy, to match how the rest
 * of this codebase does image processing (see compressImageBeforeUpload in
 * lib/utils/image-compress.ts). Swapping the segmentation provider later
 * means changing the body of removeImageBackground — cropToContent and
 * compositeOnColor are plain canvas work, independent of whichever
 * provider produced the cutout.
 */
export async function removeImageBackground(source: Blob | string): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(source, {
    // "isnet_quint8" (~40MB, quantized) instead of the ~80MB default —
    // noticeably faster to download on first use and to run on every use,
    // at a small quality cost (some artifacts on fine detail like hair)
    // that's a good trade for product photos, which are mostly solid
    // shapes on a plain background.
    model: "isnet_quint8",
  });
}

async function loadImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // Safe to revoke immediately: decode() only resolves once the pixel
    // data is already decoded into the Image element, independent of the URL.
    URL.revokeObjectURL(url);
  }
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen"))), "image/png");
  });
}

/**
 * Crops to the bounding box of the cutout's visible (non-transparent)
 * pixels — a background-removed photo otherwise keeps the full original
 * canvas size, so the actual product can end up small and off-center
 * inside a mostly-empty transparent square. Falls back to the original
 * blob unchanged if canvas 2D isn't available or the result is fully
 * transparent (nothing to crop to).
 */
export async function cropToContent(blob: Blob): Promise<Blob> {
  const img = await loadImage(blob);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return blob;
  ctx.drawImage(img, 0, 0);

  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const ALPHA_THRESHOLD = 10;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]!;
      if (alpha > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) return blob;

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  const cropped = document.createElement("canvas");
  cropped.width = cropWidth;
  cropped.height = cropHeight;
  const croppedCtx = cropped.getContext("2d");
  if (!croppedCtx) return blob;
  croppedCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return canvasToPngBlob(cropped);
}

/**
 * Composites a transparent cutout onto a solid color — e.g. the tenant's
 * own brand accent color, so a whole catalog's product photos can share
 * one consistent background instead of each one being transparent (which
 * reads differently depending on what's behind it in the catalog grid).
 */
export async function compositeOnColor(blob: Blob, color: string): Promise<Blob> {
  const img = await loadImage(blob);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return blob;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvasToPngBlob(canvas);
}

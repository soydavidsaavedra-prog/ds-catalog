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
 * The cutout keeps the original photo's exact canvas size (no auto-crop to
 * content) so it stays framed the same way it already was inside the
 * product card — cropping to the visible pixels sounded like an
 * improvement but in practice shifted/resized the subject relative to how
 * the card frames it, which read as the photo being "off" compared to the
 * tenant's other product photos.
 *
 * Flat functions, not a class/interface hierarchy, to match how the rest
 * of this codebase does image processing (see compressImageBeforeUpload in
 * lib/utils/image-compress.ts). Swapping the segmentation provider later
 * means changing the body of removeImageBackground — compositeOnColor and
 * compositeOnImage are plain canvas work, independent of whichever
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

async function loadImage(source: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(source);
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
 * Composites a transparent cutout onto a solid color — e.g. the tenant's
 * own brand accent color, or any color the admin picks — so a whole
 * catalog's product photos can share one consistent background instead of
 * each one being transparent (which reads differently depending on what's
 * behind it in the catalog grid).
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

/**
 * Composites a transparent cutout onto a custom background image the admin
 * uploads — scaled/cropped to cover the cutout's canvas (like CSS
 * `background-size: cover`) so it fills the frame without distortion.
 */
export async function compositeOnImage(blob: Blob, backgroundSource: Blob): Promise<Blob> {
  const [fg, bg] = await Promise.all([loadImage(blob), loadImage(backgroundSource)]);
  const canvas = document.createElement("canvas");
  canvas.width = fg.naturalWidth;
  canvas.height = fg.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return blob;

  const scale = Math.max(canvas.width / bg.naturalWidth, canvas.height / bg.naturalHeight);
  const drawWidth = bg.naturalWidth * scale;
  const drawHeight = bg.naturalHeight * scale;
  ctx.drawImage(bg, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
  ctx.drawImage(fg, 0, 0);
  return canvasToPngBlob(canvas);
}

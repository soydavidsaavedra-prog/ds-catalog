"use client";

/**
 * Runs entirely in the browser via WASM (@imgly/background-removal) — no
 * server involvement, no native binaries. This project already hit real
 * trouble with a native-binary image tool (sharp) breaking every upload
 * inside a Vercel serverless function (see the comment in
 * app/[tenant]/admin/api/upload/route.ts and lib/utils/image-compress.ts,
 * which is why compression also moved client-side) — a server-side ML
 * background-removal provider (rembg/ONNX on the server) would risk the
 * exact same failure mode. The WASM + ONNX model files are fetched lazily
 * from IMG.LY's CDN on first use (only when an admin actually clicks
 * "Quitar fondo"), so nothing about this loads on page load, and the
 * public storefront never imports this module at all.
 *
 * Single function, not a class/interface hierarchy, to match how the rest
 * of this codebase does image processing (see compressImageBeforeUpload in
 * lib/utils/image-compress.ts) — swapping the provider later means
 * changing the body of this one function, nothing that calls it.
 */
export async function removeImageBackground(source: Blob | string): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(source);
}

import "server-only";
import { randomUUID } from "node:crypto";
import { createJsonStore } from "@/lib/db/jsonStore";
import { bannersSeed } from "@/lib/data/seed/banners";
import type { Banner } from "@/lib/types/catalog";

const store = createJsonStore<Banner[]>("banners", bannersSeed);

export type BannerInput = Omit<Banner, "id">;

export async function listBanners(opts?: { activeOnly?: boolean }): Promise<Banner[]> {
  const banners = await store.read();
  const sorted = [...banners].sort((a, b) => a.order - b.order);
  return opts?.activeOnly ? sorted.filter((b) => b.active) : sorted;
}

export async function getBannerById(id: string): Promise<Banner | null> {
  const banners = await store.read();
  return banners.find((b) => b.id === id) ?? null;
}

export async function createBanner(input: BannerInput): Promise<Banner> {
  const banners = await store.read();
  const banner: Banner = { ...input, id: randomUUID() };
  await store.write([...banners, banner]);
  return banner;
}

export async function updateBanner(
  id: string,
  patch: Partial<BannerInput>,
): Promise<Banner | null> {
  const banners = await store.read();
  const index = banners.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updated = { ...banners[index], ...patch };
  const next = [...banners];
  next[index] = updated;
  await store.write(next);
  return updated;
}

export async function deleteBanner(id: string): Promise<void> {
  const banners = await store.read();
  await store.write(banners.filter((b) => b.id !== id));
}

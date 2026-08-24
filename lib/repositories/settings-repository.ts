import "server-only";
import { createJsonStore } from "@/lib/db/jsonStore";
import { settingsSeed } from "@/lib/data/seed/settings";
import type { SiteSettings } from "@/lib/types/catalog";

const store = createJsonStore<SiteSettings>("settings", settingsSeed);

export async function getSettings(): Promise<SiteSettings> {
  return store.read();
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await store.read();
  const updated = { ...current, ...patch };
  await store.write(updated);
  return updated;
}

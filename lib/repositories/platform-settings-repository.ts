import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { PlatformSettingsRow } from "@/lib/db/supabase-types";

export interface PlatformSettings {
  supportWhatsappNumber: string;
  supportWhatsappDisplay: string;
}

function fromRow(row: PlatformSettingsRow): PlatformSettings {
  return { supportWhatsappNumber: row.support_whatsapp_number, supportWhatsappDisplay: row.support_whatsapp_display };
}

const EMPTY_SETTINGS: PlatformSettings = { supportWhatsappNumber: "", supportWhatsappDisplay: "" };

/**
 * Singleton row (id is always `true`, enforced by the table's check
 * constraint — see supabase/schema.sql). Falls back to empty strings if
 * the row was somehow deleted (`data` null) — every WhatsApp-support-
 * button call site already treats an empty supportWhatsappNumber as "not
 * configured, don't render the button" instead of crashing.
 *
 * Also falls back to empty strings for Postgres error 42P01 ("relation
 * does not exist") specifically — this table's migration ships in the
 * same deploy as the code that queries it, but the two aren't applied
 * atomically (schema.sql is run by hand against Supabase, separately from
 * the Vercel deploy), so there's a real window where this table doesn't
 * exist yet on a freshly-deployed build. Every OTHER repository in this
 * codebase queries tables that existed from day one and doesn't need this;
 * this one is new enough that the gap actually happens in practice. Any
 * other error still throws — this isn't a blanket "swallow every DB
 * error", only the one specific, expected transition case.
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("platform_settings").select("*").eq("id", true).maybeSingle();
  if (error) {
    if (error.code === "42P01") return EMPTY_SETTINGS;
    throw error;
  }
  return data ? fromRow(data as PlatformSettingsRow) : EMPTY_SETTINGS;
}

export async function updatePlatformSettings(input: PlatformSettings): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("platform_settings")
    .upsert({ id: true, support_whatsapp_number: input.supportWhatsappNumber, support_whatsapp_display: input.supportWhatsappDisplay });
  if (error) throw error;
}

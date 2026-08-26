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

/**
 * Singleton row (id is always `true`, enforced by the table's check
 * constraint — see supabase/schema.sql). Falls back to empty strings if
 * the migration hasn't run yet or the row was somehow deleted, so every
 * WhatsApp-support-button call site can render "no configurado" instead
 * of crashing.
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("platform_settings").select("*").eq("id", true).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as PlatformSettingsRow) : { supportWhatsappNumber: "", supportWhatsappDisplay: "" };
}

export async function updatePlatformSettings(input: PlatformSettings): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("platform_settings")
    .upsert({ id: true, support_whatsapp_number: input.supportWhatsappNumber, support_whatsapp_display: input.supportWhatsappDisplay });
  if (error) throw error;
}

import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { AuditLogRow } from "@/lib/db/supabase-types";

/**
 * Append-only trail of Super Admin actions — see supabase/schema.sql's
 * ds_audit_log block for the storage design (no FK on tenant_id, so a
 * hard tenant delete never orphans or cascades away its own history).
 */

export interface AuditLogEntry {
  id: string;
  actorEmail: string;
  action: string;
  tenantId: string | null;
  tenantSlug: string | null;
  summary: string;
  createdAt: string;
}

function fromRow(row: AuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    actorEmail: row.actor_email,
    action: row.action,
    tenantId: row.tenant_id,
    tenantSlug: row.tenant_slug,
    summary: row.summary,
    createdAt: row.created_at,
  };
}

export interface RecordAuditLogInput {
  actorEmail: string;
  /** Short machine-readable key, e.g. "tenant.status_changed" — grouped/filtered by this later if the log ever needs it; kept free-form (not an enum) since it's write-only metadata, never branched on. */
  action: string;
  tenantId?: string | null;
  tenantSlug?: string | null;
  /** Human-readable one-liner shown as-is on /superadmin/auditoria — e.g. "Cambió el estado a suspended". */
  summary: string;
}

/**
 * Fail-open by design: a Supabase hiccup while writing the audit trail
 * must never turn into a failed (or worse, half-applied) admin action.
 * Every call site in app/superadmin/actions.ts awaits this AFTER its real
 * mutation has already succeeded, so the action itself is unaffected
 * either way — only logs and swallows the error.
 */
export async function recordAuditLog(input: RecordAuditLogInput): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("ds_audit_log").insert({
      actor_email: input.actorEmail,
      action: input.action,
      tenant_id: input.tenantId ?? null,
      tenant_slug: input.tenantSlug ?? null,
      summary: input.summary,
    });
    if (error) throw error;
  } catch (err) {
    console.error("[audit-log] failed to record entry:", input.action, err);
  }
}

export async function listAuditLog(limit = 200): Promise<AuditLogEntry[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ds_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as AuditLogRow[]).map(fromRow);
}

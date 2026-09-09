import "server-only";
import { sendEmail } from "@/lib/notifications/email";
import { listSuperAdminEmails } from "@/lib/repositories/app-users-repository";
import { siteConfig } from "@/lib/config/site";

/** Minimal HTML-escaping for user-supplied strings (tenant name, slug, owner email) going into an email body — this is the one spot in the app that builds raw HTML from untrusted input instead of letting JSX escape it. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface NewTenantRegistrationInput {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  ownerEmail: string;
  planName: string;
}

/** Pure email content builder — kept separate from the actual send so it's unit-testable without a network call, same split as lib/products/csv-import.ts's parser vs. its calling Server Action. */
export function buildNewTenantRegistrationEmail(input: NewTenantRegistrationInput): { subject: string; html: string } {
  const reviewUrl = `${siteConfig.seo.domain}/superadmin/tenants/${input.tenantId}`;
  return {
    subject: `Nuevo registro pendiente: ${input.tenantName}`,
    html: `
      <p>Un nuevo negocio se registró en DS Catalog y está esperando tu revisión para activarse:</p>
      <ul>
        <li><strong>Negocio:</strong> ${escapeHtml(input.tenantName)} (/${escapeHtml(input.tenantSlug)})</li>
        <li><strong>Correo del dueño:</strong> ${escapeHtml(input.ownerEmail)}</li>
        <li><strong>Plan elegido:</strong> ${escapeHtml(input.planName)}</li>
      </ul>
      <p><a href="${reviewUrl}">Revisar y activar la cuenta →</a></p>
    `.trim(),
  };
}

/**
 * Fires the moment a self-registered tenant finishes onboarding (see
 * completeOnboardingAction in app/[tenant]/admin/actions.ts) — that's
 * exactly when a subscription lands in "pending", needing a Super Admin
 * to review and activate it (see lib/tenant/plan-limits.ts). Fans out to
 * every Super Admin's email, not just one hardcoded address.
 *
 * Fail-open by design, same reasoning as lib/audit/audit-log.ts's
 * recordAuditLog: a notification hiccup (or no email provider configured
 * at all) must never block a tenant from finishing their own onboarding.
 */
export async function notifyNewTenantRegistration(input: NewTenantRegistrationInput): Promise<void> {
  try {
    const emails = await listSuperAdminEmails();
    if (emails.length === 0) return;
    const { subject, html } = buildNewTenantRegistrationEmail(input);
    await sendEmail({ to: emails, subject, html });
  } catch (err) {
    console.error("[notifications] failed to notify new tenant registration:", err);
  }
}

import "server-only";

/**
 * Thin wrapper over Resend's REST API — this project's only outbound
 * "arbitrary" transactional email (Supabase Auth already sends its own
 * password-reset/invite emails independently — see
 * lib/auth/supabase-auth.ts — and doesn't go through this).
 *
 * Deliberately optional, same pattern as this project's Sentry and
 * Vercel Domains wiring: without RESEND_API_KEY/RESEND_FROM_EMAIL set,
 * this silently no-ops (logs only) instead of throwing, so a platform
 * that hasn't set up an email provider yet keeps working exactly as
 * before — every call site treats "not configured" the same as "sent,
 * but nobody happened to be listed as a recipient," never as an error
 * that should block the real action it was triggered by.
 */

export interface SendEmailInput {
  to: string[];
  subject: string;
  html: string;
}

export type SendEmailResult = { sent: true } | { sent: false; reason: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.log(`[email] RESEND_API_KEY/RESEND_FROM_EMAIL no configurados — omitiendo envío: "${input.subject}"`);
    return { sent: false, reason: "not_configured" };
  }
  if (input.to.length === 0) {
    return { sent: false, reason: "no_recipients" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] Resend respondió con error:", res.status, body);
      return { sent: false, reason: `resend_${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] fallo de red al enviar:", err);
    return { sent: false, reason: "network_error" };
  }
}

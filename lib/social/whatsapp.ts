import "server-only";

/**
 * Thin wrapper over the WhatsApp Business Platform (Cloud API) — same
 * Graph API family as lib/social/meta.ts, but connected differently: FB
 * Pages/Instagram go through the OAuth redirect in
 * app/api/social/oauth/callback/route.ts, while a WhatsApp number is
 * connected by pasting its Phone Number ID + a permanent access token
 * (generated from a System User in Meta Business Suite) directly into
 * /admin/redes-sociales/cuentas — Meta's real onboarding flow (Embedded
 * Signup) is a JS SDK popup with its own review requirements, out of
 * scope here. See connectWhatsAppAccountAction in
 * app/[tenant]/admin/(shell)/redes-sociales/actions.ts.
 *
 * IMPORTANT — real limits, not implementation gaps:
 * - WhatsApp has no feed/posts, only messaging (see
 *   SOCIAL_PLATFORMS_WITHOUT_POSTS in lib/types/social.ts) — there is no
 *   `publishWhatsApp*` function here on purpose.
 * - Free-form text replies (sendWhatsAppTextMessage) only work within 24h
 *   of the customer's last message ("customer service window"). Outside
 *   that window, WhatsApp requires a pre-approved message **template**
 *   (a separate Business Manager review process) — sending template
 *   messages isn't implemented here.
 * - A brand-new test number (the free one Meta gives every WhatsApp use
 *   case for development) can only message phone numbers you've added as
 *   testers in the Meta dashboard, until the number/app goes through
 *   review.
 */

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

interface GraphError {
  error?: { message: string; type: string; code: number };
}

async function graphFetch<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GRAPH_API_BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...init?.headers },
  });
  const body = (await res.json().catch(() => ({}))) as T & GraphError;
  if (!res.ok || body.error) {
    throw new Error(body.error?.message ?? `WhatsApp (Meta Graph) respondió ${res.status}.`);
  }
  return body;
}

export interface WhatsAppPhoneNumberInfo {
  verifiedName: string;
  displayPhoneNumber: string;
  qualityRating: string | null;
}

/** Called when connecting a number, both to validate the token/phone number id pair and to get a display name for the account list. */
export async function getWhatsAppPhoneNumberInfo(phoneNumberId: string, accessToken: string): Promise<WhatsAppPhoneNumberInfo> {
  const data = await graphFetch<{ verified_name: string; display_phone_number: string; quality_rating?: string }>(
    `/${phoneNumberId}?fields=verified_name,display_phone_number,quality_rating`,
    accessToken,
    { method: "GET" },
  );
  return {
    verifiedName: data.verified_name,
    displayPhoneNumber: data.display_phone_number,
    qualityRating: data.quality_rating ?? null,
  };
}

/** Free-form text reply — only deliverable within the 24h customer service window (see module doc comment above). */
export async function sendWhatsAppTextMessage(phoneNumberId: string, accessToken: string, to: string, text: string): Promise<void> {
  await graphFetch(`/${phoneNumberId}/messages`, accessToken, {
    method: "POST",
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
  });
}

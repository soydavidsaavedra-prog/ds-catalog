import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { signOAuthState } from "@/lib/social/oauth-state";
import { isMetaConfigured, buildMetaAuthUrl } from "@/lib/social/meta";
import { isTikTokConfigured, buildTikTokAuthUrl } from "@/lib/social/tiktok";

/** Where Meta/TikTok redirect back to once the person approves the dialog — must exactly match a Redirect URI registered on the App (Meta) / registered domain (TikTok). One fixed URL for every tenant; the tenant rides along inside the signed `state`, not the URL. */
function callbackUrl(request: Request): string {
  return new URL("/api/social/oauth/callback", request.url).toString();
}

export async function GET(request: Request, { params }: { params: Promise<{ tenant: string; platform: string }> }) {
  const { tenant: tenantSlug, platform } = await params;
  if (!(await isAdminAuthenticated(tenantSlug))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const returnTo = `/${tenantSlug}/admin/redes-sociales/cuentas`;
  const state = await signOAuthState({ tenantSlug, platform, returnTo, issuedAt: Date.now() });
  const redirectUri = callbackUrl(request);

  if (platform === "meta") {
    if (!isMetaConfigured()) {
      return NextResponse.redirect(new URL(`${returnTo}?error=meta_not_configured`, request.url));
    }
    return NextResponse.redirect(buildMetaAuthUrl(state, redirectUri));
  }

  if (platform === "tiktok") {
    if (!isTikTokConfigured()) {
      return NextResponse.redirect(new URL(`${returnTo}?error=tiktok_not_configured`, request.url));
    }
    return NextResponse.redirect(buildTikTokAuthUrl(state, redirectUri));
  }

  return NextResponse.json({ error: "Plataforma desconocida" }, { status: 400 });
}

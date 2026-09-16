import { NextResponse } from "next/server";
import { verifyOAuthState } from "@/lib/social/oauth-state";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { getAppUserByTenantId } from "@/lib/repositories/app-users-repository";
import { upsertSocialAccount } from "@/lib/repositories/social-accounts-repository";
import { exchangeMetaCode, getLongLivedUserToken, listConnectablePages } from "@/lib/social/meta";
import { exchangeTikTokCode, getTikTokUserInfo } from "@/lib/social/tiktok";

/**
 * One fixed callback URL shared by both Meta and TikTok (registered as
 * the Redirect URI on each app) — see app/[tenant]/admin/api/social/oauth/[platform]/start/route.ts,
 * which encodes which tenant/platform this round-trip belongs to inside
 * the signed `state` instead of the URL, since the URL itself can't vary
 * per tenant without registering one Redirect URI per tenant on both
 * providers (impractical for a multi-tenant app).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateToken = url.searchParams.get("state");
  const providerError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  const state = stateToken ? await verifyOAuthState(stateToken) : null;
  if (!state) {
    return NextResponse.json({ error: "Estado de OAuth inválido o expirado. Vuelve a intentar la conexión." }, { status: 400 });
  }

  const failureRedirect = (reason: string) => NextResponse.redirect(new URL(`${state.returnTo}?error=${reason}`, request.url));

  if (providerError) return failureRedirect(encodeURIComponent(providerError));
  if (!code) return failureRedirect("missing_code");

  const tenant = await resolveTenant(state.tenantSlug);
  const owner = await getAppUserByTenantId(tenant.id);
  const connectedBy = owner?.email ?? "";
  const redirectUri = new URL("/api/social/oauth/callback", request.url).toString();

  try {
    if (state.platform === "meta") {
      const { accessToken: shortLivedToken } = await exchangeMetaCode(code, redirectUri);
      const { accessToken: userToken } = await getLongLivedUserToken(shortLivedToken);
      const pages = await listConnectablePages(userToken);

      if (pages.length === 0) {
        return failureRedirect("no_pages_found");
      }

      for (const page of pages) {
        await upsertSocialAccount(tenant.id, {
          platform: "meta_facebook",
          externalAccountId: page.pageId,
          displayName: page.pageName,
          accessToken: page.pageAccessToken,
          refreshToken: null,
          tokenExpiresAt: null,
          scopes: [],
          connectedBy,
          status: "active",
        });

        if (page.instagramBusinessAccountId) {
          await upsertSocialAccount(tenant.id, {
            platform: "meta_instagram",
            externalAccountId: page.instagramBusinessAccountId,
            displayName: `${page.pageName} (Instagram)`,
            accessToken: page.pageAccessToken,
            refreshToken: null,
            tokenExpiresAt: null,
            scopes: [],
            connectedBy,
            status: "active",
          });
        }
      }
    } else if (state.platform === "tiktok") {
      const token = await exchangeTikTokCode(code, redirectUri);
      const userInfo = await getTikTokUserInfo(token.accessToken);

      await upsertSocialAccount(tenant.id, {
        platform: "tiktok",
        externalAccountId: token.openId,
        displayName: userInfo.displayName,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        tokenExpiresAt: new Date(Date.now() + token.expiresInSeconds * 1000).toISOString(),
        scopes: [],
        connectedBy,
        status: "active",
      });
    } else {
      return failureRedirect("unknown_platform");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return failureRedirect(encodeURIComponent(message));
  }

  return NextResponse.redirect(new URL(`${state.returnTo}?connected=1`, request.url));
}

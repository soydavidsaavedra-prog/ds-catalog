import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, computeSessionToken } from "@/lib/auth/admin-token";
import { SUPERADMIN_SESSION_COOKIE, verifySuperadminSessionCookie } from "@/lib/auth/superadmin-token";
import { isPlatformHost } from "@/lib/domains/validate-domain";
import { resolveTenantSlugByCustomDomain } from "@/lib/domains/resolve-tenant-by-host";
import { siteConfig } from "@/lib/config/site";

function platformHost(): string {
  try {
    return new URL(siteConfig.seo.domain).hostname;
  } catch {
    return "ds-catalog.vercel.app";
  }
}

/**
 * If this request arrived on a tenant's own custom domain (see
 * lib/domains/, app/[tenant]/admin/(shell)/dominio) instead of
 * {platform}/{slug}, resolves the internal pathname the rest of this file
 * — and the whole app — should treat the request as. Every other route,
 * layout and repository call keeps working unchanged: this rewrite is the
 * ONLY place that knows a request came in on a custom domain.
 *
 * Returns a 404 NextResponse directly for a host that isn't the platform
 * and isn't a verified, active tenant's domain — rather than falling
 * through to whatever the bare pathname happens to resolve to under the
 * platform's own routing (e.g. its landing page), which would be
 * confusing to show under a stranger's domain and could only happen from
 * a spoofed/stale Host header in the first place, since Vercel only
 * routes traffic here at all for domains actually registered to this
 * project.
 */
async function resolveEffectivePathname(request: NextRequest): Promise<string | NextResponse> {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (!host || isPlatformHost(host, platformHost())) {
    return request.nextUrl.pathname;
  }

  const slug = await resolveTenantSlugByCustomDomain(host);
  if (!slug) {
    return new NextResponse("Not found", { status: 404 });
  }

  const suffix = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname;
  return `/${slug}${suffix}`;
}

/**
 * Protects /[tenant]/admin/:path* — the tenant slug is just the first
 * segment of `pathname` (the custom-domain-rewritten one, so this works
 * identically whether the request came in as {platform}/{slug}/admin or
 * {slug}'s own custom domain's /admin). The expected cookie value is
 * derived from that same slug (see lib/auth/admin-token.ts), so a session
 * for one tenant's admin panel never authenticates another tenant's.
 */
async function tenantAdminMiddleware(request: NextRequest, pathname: string): Promise<NextResponse | undefined> {
  const segments = pathname.split("/").filter(Boolean);
  const [tenant, adminSegment, maybeLogin] = segments;

  if (adminSegment !== "admin") {
    return undefined;
  }
  if (maybeLogin === "login") {
    return undefined;
  }

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const expected = await computeSessionToken(tenant);

  if (cookieValue !== expected) {
    const loginUrl = new URL("/acceder", request.url);
    loginUrl.searchParams.set("tenant", tenant);
    return NextResponse.redirect(loginUrl);
  }

  return undefined;
}

/**
 * Protects /superadmin/:path* — entirely independent of tenant-admin
 * sessions (different cookie, different secret, no tenant slug involved
 * at all). See lib/auth/superadmin-token.ts for why the cookie itself
 * carries the account id: unlike tenant admin, there's no slug in the URL
 * to scope the session to. This never touches the database — a
 * cryptographically valid but deactivated account still needs the
 * server-side check in app/superadmin/layout.tsx (see
 * getAuthenticatedSuperadmin), same defense-in-depth pattern as tenant
 * admin's (shell) layout.
 */
async function superadminMiddleware(request: NextRequest, pathname: string): Promise<NextResponse | undefined> {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "superadmin") {
    return undefined;
  }
  if (segments[1] === "login") {
    return undefined;
  }

  const cookieValue = request.cookies.get(SUPERADMIN_SESSION_COOKIE)?.value;
  const userId = await verifySuperadminSessionCookie(cookieValue);

  if (!userId) {
    const loginUrl = new URL("/acceder", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return undefined;
}

export async function middleware(request: NextRequest) {
  const resolved = await resolveEffectivePathname(request);
  if (resolved instanceof NextResponse) {
    return resolved;
  }
  const pathname = resolved;

  const authResponse =
    (await tenantAdminMiddleware(request, pathname)) ?? (await superadminMiddleware(request, pathname));
  if (authResponse) {
    return authResponse;
  }

  if (pathname !== request.nextUrl.pathname) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

/**
 * Runs on every request except Next's own internal assets and files with
 * a plain extension (images, .ico, .xml, .txt, ...) — broadened from the
 * previous admin/superadmin-only matcher because the custom-domain
 * rewrite above needs to see EVERY path (a tenant's own domain serves
 * their whole storefront, not just /admin). robots.txt/sitemap.xml are
 * excluded on purpose: those stay platform-level for now (see
 * app/robots.ts, app/sitemap.ts) rather than per-custom-domain — a known,
 * acceptable gap for this feature's first version.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};

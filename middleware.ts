import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, computeSessionToken } from "@/lib/auth/admin-token";
import { SUPERADMIN_SESSION_COOKIE, verifySuperadminSessionCookie } from "@/lib/auth/superadmin-token";

/**
 * Protects /[tenant]/admin/:path* — the tenant slug is just the first URL
 * segment, read directly from the path (no DB call, stays Edge-fast). The
 * expected cookie value is derived from that same slug (see
 * lib/auth/admin-token.ts), so a session for one tenant's admin panel
 * never authenticates another tenant's.
 */
async function tenantAdminMiddleware(request: NextRequest): Promise<NextResponse | undefined> {
  const { pathname } = request.nextUrl;
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
    const loginUrl = new URL(`/${tenant}/admin/login`, request.url);
    loginUrl.searchParams.set("from", pathname);
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
async function superadminMiddleware(request: NextRequest): Promise<NextResponse | undefined> {
  const { pathname } = request.nextUrl;
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
    const loginUrl = new URL("/superadmin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return undefined;
}

export async function middleware(request: NextRequest) {
  return (await tenantAdminMiddleware(request)) ?? (await superadminMiddleware(request)) ?? NextResponse.next();
}

export const config = {
  matcher: ["/:tenant/admin/:path*", "/superadmin", "/superadmin/:path*"],
};

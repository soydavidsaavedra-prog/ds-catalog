import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, computeSessionToken } from "@/lib/auth/admin-token";

/**
 * Protects /[tenant]/admin/:path* — the tenant slug is just the first URL
 * segment, read directly from the path (no DB call, stays Edge-fast). The
 * expected cookie value is derived from that same slug (see
 * lib/auth/admin-token.ts), so a session for one tenant's admin panel
 * never authenticates another tenant's.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const [tenant, adminSegment, maybeLogin] = segments;

  if (adminSegment !== "admin") {
    return NextResponse.next();
  }
  if (maybeLogin === "login") {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const expected = await computeSessionToken(tenant);

  if (cookieValue !== expected) {
    const loginUrl = new URL(`/${tenant}/admin/login`, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:tenant/admin/:path*"],
};

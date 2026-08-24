import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, computeSessionToken } from "@/lib/auth/admin-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const expected = await computeSessionToken();

  if (cookieValue !== expected) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

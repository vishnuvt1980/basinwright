import { NextResponse, type NextRequest } from "next/server";

import { decryptSession, SESSION_COOKIE } from "@/lib/session-token";

/// Optimistic gate for the admin area. Every Server Action and admin page
/// re-verifies the session itself — Server Function POSTs are not reliably
/// covered by proxy matchers.
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const isLogin = pathname === "/admin/login";
  const session = await decryptSession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isLogin) {
    const url = new URL("/admin/login", req.nextUrl);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session && isLogin) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

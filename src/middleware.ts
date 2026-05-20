import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/lib/routes";

const PUBLIC_PATHS = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Escape hatch flag — set by the client when a refresh has just failed.
  // Lets the user reach /login even if the stale refreshToken cookie could
  // not be deleted (Next.js server blip, etc.), preventing an infinite
  // /login → /dashboard ping-pong.
  const sessionExpired = req.nextUrl.searchParams.get("session") === "expired";

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const hasToken = req.cookies.has("refreshToken");
    if (hasToken && !sessionExpired)
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url));
    return NextResponse.next();
  }

  const hasToken = req.cookies.has("refreshToken");
  if (!hasToken) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|logo.svg).*)"],
};

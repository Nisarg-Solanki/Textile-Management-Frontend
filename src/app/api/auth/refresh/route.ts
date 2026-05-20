import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Proxies POST /auth/refresh through the Next.js server so the HttpOnly
// refreshToken cookie (which lives on the frontend domain) can be read here
// and forwarded to the backend as a Cookie header. Required in production
// where the frontend and backend run on different origins and the browser
// will not send the frontend-domain cookie on a cross-origin call.

type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  maxAge?: number;
  domain?: string;
  expires?: Date;
};

function parseSetCookieHeader(cookieStr: string): {
  name: string;
  value: string;
  options: CookieOptions;
} {
  const parts = cookieStr.split(";").map((p) => p.trim());
  const firstEq = parts[0].indexOf("=");
  const name = parts[0].slice(0, firstEq);
  const value = parts[0].slice(firstEq + 1);

  const options: CookieOptions = {};
  for (const attr of parts.slice(1)) {
    if (/^httponly$/i.test(attr)) options.httpOnly = true;
    else if (/^secure$/i.test(attr)) options.secure = true;
    else {
      const eq = attr.indexOf("=");
      if (eq === -1) continue;
      const k = attr.slice(0, eq).trim().toLowerCase();
      const v = attr.slice(eq + 1).trim();
      if (k === "samesite")
        options.sameSite = v.toLowerCase() as "strict" | "lax" | "none";
      else if (k === "path") options.path = v;
      else if (k === "max-age") options.maxAge = parseInt(v, 10);
      else if (k === "domain") options.domain = v;
      else if (k === "expires") options.expires = new Date(v);
    }
  }

  return { name, value, options };
}

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken");

  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        message: "No refresh token",
        code: "NO_REFRESH_TOKEN",
      },
      { status: 401 },
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!backendUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Backend URL not configured",
        code: "CONFIG_ERROR",
      },
      { status: 500 },
    );
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken.value}`,
      },
      body: JSON.stringify({}),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Network error contacting auth server",
        code: "NETWORK_ERROR",
      },
      { status: 502 },
    );
  }

  if (!backendRes.ok) {
    cookieStore.delete("refreshToken");
    const body = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      {
        success: false,
        message: body?.message ?? "Session expired",
        code: body?.code ?? "REFRESH_FAILED",
      },
      { status: backendRes.status },
    );
  }

  // Forward any rotated refresh token cookie from backend → browser
  const setCookieHeaders =
    typeof backendRes.headers.getSetCookie === "function"
      ? backendRes.headers.getSetCookie()
      : [];
  for (const cookieStr of setCookieHeaders) {
    try {
      const { name, value, options } = parseSetCookieHeader(cookieStr);
      cookieStore.set(name, value, options);
    } catch {
      // ignore malformed Set-Cookie entries
    }
  }

  const data = await backendRes.json();
  return NextResponse.json(data);
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Called by the Axios interceptor in client.ts when a token refresh fails
// and the client cannot call a Server Action directly. Deletes the HttpOnly
// refreshToken cookie so the middleware stops redirecting to /dashboard.
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("refreshToken");
  return NextResponse.json({ ok: true });
}

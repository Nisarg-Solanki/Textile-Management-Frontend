"use server";

import { cookies } from "next/headers";
import { logout, approveUser, rejectUser } from "@/lib/api/auth";
import { apiClient } from "@/lib/api/client";
import { getOne } from "@/lib/api/request";
import { handleApiError } from "@/lib/utils/handleError";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import type { AuthUser, Permission } from "@/lib/store/authStore";

type LoginSuccess = {
  success: true;
  user: AuthUser;
  accessToken: string;
  permissions: Permission[];
};

type LoginFailure = {
  success: false;
  message: string;
};

export type LoginActionResult = LoginSuccess | LoginFailure;

type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  maxAge?: number;
  domain?: string;
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
    if (/^http(?:only)$/i.test(attr)) options.httpOnly = true;
    else if (/^secure$/i.test(attr)) options.secure = true;
    else {
      const [key, ...rest] = attr.split("=");
      const val = rest.join("=").trim();
      const k = key.trim().toLowerCase();
      if (k === "samesite")
        options.sameSite = val.toLowerCase() as "strict" | "lax" | "none";
      else if (k === "path") options.path = val;
      else if (k === "max-age") options.maxAge = parseInt(val, 10);
      else if (k === "domain") options.domain = val;
    }
  }

  return { name, value, options };
}

export async function loginAction(
  email: string,
  password: string,
): Promise<LoginActionResult> {
  try {
    // Use apiClient directly (not post() helper) so we can access the raw
    // Set-Cookie response header and forward it to the browser via Next.js cookies().
    // The post() helper discards headers and only returns res.data.data.
    const res = await apiClient.post<{
      success: boolean;
      data: { user: AuthUser; accessToken: string };
    }>("/auth/login", { email, password });

    const { user, accessToken } = res.data.data;

    const rawCookies = res.headers["set-cookie"];
    if (rawCookies?.length) {
      const cookieStore = await cookies();
      for (const cookieStr of rawCookies) {
        const { name, value, options } = parseSetCookieHeader(cookieStr);
        cookieStore.set(name, value, options);
      }
    }

    let permissions: Permission[] = [];
    if (user.role === "admin") {
      permissions = await getOne<Permission[]>(
        `/permissions/${user.id}`,
        accessToken,
      );
    }

    return { success: true, user, accessToken, permissions };
  } catch (err) {
    const apiError = handleApiError(err);
    return { success: false, message: apiError.message };
  }
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect(ROUTES.LOGIN);
}

export async function approveUserAction(id: string): Promise<void> {
  await approveUser(id);
  revalidatePath(ROUTES.ADMIN.PENDING_USERS);
}

export async function rejectUserAction(id: string): Promise<void> {
  await rejectUser(id);
  revalidatePath(ROUTES.ADMIN.PENDING_USERS);
}

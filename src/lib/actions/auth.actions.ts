"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  loginRaw,
  logout,
  buildSession,
  approveUser,
  rejectUser,
} from "@/lib/api/auth";
import { handleApiError } from "@/lib/utils/handleError";
import { ROUTES } from "@/lib/routes";
import type { AuthUser, Permission } from "@/types/app";

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
    const { data, setCookieHeader } = await loginRaw(email, password);
    const { user, accessToken } = data;

    if (setCookieHeader?.length) {
      const cookieStore = await cookies();
      for (const cookieStr of setCookieHeader) {
        const { name, value, options } = parseSetCookieHeader(cookieStr);
        cookieStore.set(name, value, options);
      }
    }

    const session = await buildSession(user, accessToken);
    return {
      success: true,
      user: session.user,
      accessToken: session.accessToken,
      permissions: session.permissions,
    };
  } catch (err) {
    const apiError = handleApiError(err);
    return { success: false, message: apiError.message };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await logout();
  } catch {
    // proceed with cookie cleanup even if the backend call fails
  }
  const cookieStore = await cookies();
  cookieStore.delete("refreshToken");
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

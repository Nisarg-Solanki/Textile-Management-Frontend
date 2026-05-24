import { apiClient } from "@/lib/api/client";
import { post, getOne, getList, del } from "@/lib/api/request";
import type { ApiResponse, PaginatedResponse } from "@/lib/api/request";
import { handleApiError, ApiError } from "@/lib/utils/handleError";
import type { AuthUser, Permission, PermissionsApiResponse } from "@/types/app";

type EmptyBody = Record<string, never>;

// ─── Response shapes ────────────────────────────────────────────────────────

export type LoginResponse = {
  user: AuthUser;
  accessToken: string;
};

export type RefreshResponse = {
  user: AuthUser;
  accessToken: string;
};

export type Session = {
  user: AuthUser;
  accessToken: string;
  permissions: Permission[];
};

// ─── Bare API calls ─────────────────────────────────────────────────────────

export function login(email: string, password: string): Promise<LoginResponse> {
  return post<{ email: string; password: string }, LoginResponse>(
    "/auth/login",
    { email, password },
  );
}

export function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  return post<{ name: string; email: string; password: string }, AuthUser>(
    "/auth/register",
    { name, email, password },
  );
}

export function logout(): Promise<void> {
  return post<EmptyBody, void>("/auth/logout", {});
}

export function forgotPassword(email: string): Promise<void> {
  return post<{ email: string }, void>("/auth/forgot-password", { email });
}

export function resetPassword(token: string, password: string): Promise<void> {
  return post<{ token: string; password: string }, void>(
    "/auth/reset-password",
    { token, password },
  );
}

// Refresh goes through the local Next.js API route (/api/auth/refresh).
// The route runs server-side, reads the HttpOnly refreshToken cookie via
// next/headers, and forwards it to the backend as a Cookie header — avoiding
// the cross-origin cookie problem in production where the frontend and
// backend live on different domains.
export async function refresh(): Promise<RefreshResponse> {
  let res: Response;
  try {
    res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Network error. Please check your connection.",
      "NETWORK_ERROR",
      0,
    );
  }

  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: RefreshResponse;
    message?: string;
    code?: string;
  };

  if (!res.ok || !json.data) {
    throw new ApiError(
      json.message ?? "Session expired",
      json.code ?? "REFRESH_FAILED",
      res.status,
    );
  }

  return json.data;
}

export async function getPermissionsFor(
  userId: string,
  accessToken?: string,
): Promise<Permission[]> {
  const data = await getOne<PermissionsApiResponse>(`/permissions/${userId}`, accessToken);
  return data.permissions;
}

// ─── Composed flows ─────────────────────────────────────────────────────────

/**
 * Build a full client session from a user + access token.
 * Fetches permissions for admin users; super_admins skip the call.
 * Permissions failures are swallowed — the user can still navigate, just
 * without elevated permissions until next refresh.
 */
export async function buildSession(
  user: AuthUser,
  accessToken: string,
): Promise<Session> {
  let permissions: Permission[] = [];
  if (user.role === "admin") {
    try {
      permissions = await getPermissionsFor(user.id, accessToken);
    } catch {
      // permissions stay empty if the fetch fails
    }
  }
  return { user, accessToken, permissions };
}

/**
 * Single source of truth for re-hydrating auth on a hard page refresh.
 * Calls /auth/refresh (cookie-authenticated) then fetches permissions
 * for admin users.
 */
export async function refreshSession(): Promise<Session> {
  const { user, accessToken } = await refresh();
  return buildSession(user, accessToken);
}

// ─── Server-action only: raw login that exposes Set-Cookie headers ──────────

export type LoginRawResult = {
  data: LoginResponse;
  setCookieHeader: string[] | undefined;
};

/**
 * Server-action variant of login(): bypasses the post() helper so the caller
 * can read Set-Cookie headers off the response and forward them to the
 * browser via Next.js cookies(). Do not call from client components — the
 * browser handles cookies automatically and headers are not useful there.
 */
export async function loginRaw(
  email: string,
  password: string,
): Promise<LoginRawResult> {
  try {
    const res = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      { email, password },
    );
    const setCookie = res.headers["set-cookie"];
    return {
      data: res.data.data,
      setCookieHeader: Array.isArray(setCookie) ? setCookie : undefined,
    };
  } catch (err) {
    throw handleApiError(err);
  }
}

// ─── Admin user operations ───────────────────────────────────────────────────

export function getUsers(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<AuthUser>> {
  return getList<AuthUser>("/auth/users", params);
}

export function getPendingUsers(): Promise<PaginatedResponse<AuthUser>> {
  return getList<AuthUser>("/auth/pending-users");
}

export function approveUser(id: string): Promise<AuthUser> {
  return post<EmptyBody, AuthUser>(`/auth/approve-user/${id}`, {});
}

export function rejectUser(id: string): Promise<AuthUser> {
  return post<EmptyBody, AuthUser>(`/auth/reject-user/${id}`, {});
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  return post<{ name: string; email: string; password: string }, AuthUser>(
    "/auth/users",
    data,
  );
}

export function deleteUser(id: string): Promise<void> {
  return del(`/auth/users/${id}`);
}

import { post, getList } from "@/lib/api/request";
import type { PaginatedResponse } from "@/lib/api/request";
import type { AuthUser } from "@/types/app";

type EmptyBody = Record<string, never>;

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RefreshResponse = {
  accessToken: string;
};

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

export async function logout(): Promise<void> {
  await post<EmptyBody, void>("/auth/logout", {});
}

export async function forgotPassword(email: string): Promise<void> {
  await post<{ email: string }, void>("/auth/forgot-password", { email });
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await post<{ token: string; password: string }, void>(
    "/auth/reset-password",
    {
      token,
      password,
    },
  );
}

export function refreshToken(): Promise<RefreshResponse> {
  return post<EmptyBody, RefreshResponse>("/auth/refresh", {});
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

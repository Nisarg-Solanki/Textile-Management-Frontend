import { apiClient } from "./client";
import { handleApiError } from "@/lib/utils/handleError";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getList<T>(
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<PaginatedResponse<T>> {
  try {
    const res = await apiClient.get<PaginatedResponse<T>>(url, { params });
    return res.data;
  } catch (err) {
    throw handleApiError(err);
  }
}

function authHeader(
  token?: string,
): { headers: { Authorization: string } } | undefined {
  if (token) return { headers: { Authorization: `Bearer ${token}` } };
  return undefined;
}

export async function getOne<T>(url: string, token?: string): Promise<T> {
  try {
    const res = await apiClient.get<ApiResponse<T>>(url, authHeader(token));
    return res.data.data;
  } catch (err) {
    throw handleApiError(err);
  }
}

export async function post<TBody, TResponse>(
  url: string,
  body: TBody,
  token?: string,
): Promise<TResponse> {
  try {
    const res = await apiClient.post<ApiResponse<TResponse>>(
      url,
      body,
      authHeader(token),
    );
    return res.data.data;
  } catch (err) {
    throw handleApiError(err);
  }
}

export async function put<TBody, TResponse>(
  url: string,
  body: TBody,
  token?: string,
): Promise<TResponse> {
  try {
    const res = await apiClient.put<ApiResponse<TResponse>>(
      url,
      body,
      authHeader(token),
    );
    return res.data.data;
  } catch (err) {
    throw handleApiError(err);
  }
}

export async function del(url: string, token?: string): Promise<void> {
  try {
    await apiClient.delete(url, authHeader(token));
  } catch (err) {
    throw handleApiError(err);
  }
}

import { getOne, put } from "@/lib/api/request";
import type { PermissionRow } from "@/types/app";

export type { PermissionRow };

export function getPermissions(adminId: string): Promise<PermissionRow[]> {
  return getOne<PermissionRow[]>(`/permissions/${adminId}`);
}

export function updatePermissions(
  adminId: string,
  data: PermissionRow[],
): Promise<PermissionRow[]> {
  return put<PermissionRow[], PermissionRow[]>(`/permissions/${adminId}`, data);
}
